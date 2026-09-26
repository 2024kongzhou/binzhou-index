import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock
from editorial import publish, duplicate

class EditorialTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.site = Mock()
        self.site.get_posts.return_value = []
        self.site.create_post.return_value = {'id': 1}
        body = '滨州惠民县开展文明志愿服务。' * 30
        self.proposal = {'eligible': True, 'category':'好人好事', 'subject':'惠民文明志愿服务',
                        'localityEvidence':'滨州惠民县', 'title':'滨州惠民志愿服务温暖邻里',
                        'content':body, 'excerpt':'服务邻里', 'imageSubject':'志愿服务',
                        'imagePrompt':'滨州惠民社区志愿者帮助邻里整理环境的温暖插画'}
        self.hub = SimpleNamespace(DATA_DIR=self.tmp.name, STATE_FILE='none',
            SITE_BASE_URL='https://example.test', site_client=self.site,
            bj_str=lambda fmt=None:'20260927', load_json=lambda p,d:d,
            save_json=lambda p,v:Path(p).write_text(json.dumps(v),encoding='utf8'),
            crawler=SimpleNamespace(fetch_iqilu=lambda:[{'url':'https://source.test/a','title':'志愿服务'}],
                                    fetch_binzhouw=lambda:[], fetch_article=lambda u:body),
            call_sensenova=Mock(side_effect=[json.dumps(self.proposal), json.dumps({'supported':True,'distinct':True,'imageRelevant':True})]),
            generate_cover_image=Mock(return_value=(b'x'*3000,'image/png')),
            upload_image_to_oracle=Mock(return_value='/api/img/test.png'), pushplus=Mock(return_value=True))

    def test_day_is_idempotent(self):
        self.site.get_posts.return_value=[{'slug':'daily-20260927'}]
        self.assertEqual(publish(self.hub)['skipped'],'already_exists')
        self.hub.call_sensenova.assert_not_called()
        self.hub.pushplus.assert_not_called()

    def test_publication_persists_and_push_contains_cover(self):
        self.assertTrue(publish(self.hub)['ok'])
        self.assertEqual(len(json.loads((Path(self.tmp.name)/'editorial_ledger.json').read_text())),1)
        self.assertIn('<img ',self.hub.pushplus.call_args.args[1])
        publish(self.hub)
        self.site.create_post.assert_called_once()
        self.hub.pushplus.assert_called_once()

    def test_image_failure_does_not_publish(self):
        self.hub.generate_cover_image.side_effect=RuntimeError('offline')
        with self.assertRaises(RuntimeError): publish(self.hub)
        self.site.create_post.assert_not_called()
        self.hub.pushplus.assert_not_called()

    def test_invalid_locality_does_not_publish(self):
        self.proposal['localityEvidence']='杭州西湖'
        self.hub.call_sensenova.side_effect=[json.dumps(self.proposal)]
        self.assertFalse(publish(self.hub)['ok'])
        self.site.create_post.assert_not_called()

    def test_corrupt_history_fails_closed(self):
        (Path(self.tmp.name)/'editorial_ledger.json').write_text('broken')
        with self.assertRaises(json.JSONDecodeError): publish(self.hub)
        self.site.create_post.assert_not_called()

    def test_semantic_and_subject_dedup(self):
        self.assertTrue(duplicate('一碗家乡味', '锅子饼', [{'title':'惠民锅子饼的故事'}]))
        self.assertTrue(duplicate('古村的今天', '八里王', [{'title':'另一标题','subject':'八里王'}]))

    def test_recover_committed_post_after_timeout(self):
        pending={'slug':'daily-20260926','subject':'旧主题'}
        (Path(self.tmp.name)/'editorial_pending.json').write_text(json.dumps(pending))
        self.site.get_posts.return_value=[pending,{'slug':'daily-20260927'}]
        publish(self.hub)
        self.assertEqual(json.loads((Path(self.tmp.name)/'editorial_ledger.json').read_text()),[pending])

if __name__=='__main__': unittest.main()
