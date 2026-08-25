import { setCookie } from "../../../_utils/auth";

export const onRequestPost: PagesFunction = async () => {
  const headers = new Headers({ "Content-Type": "application/json" });
  setCookie(headers, "token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 0,
    path: "/",
  });
  return new Response(JSON.stringify({ success: true }), { headers });
};

export const onRequestGet: PagesFunction = async () => {
  const headers = new Headers({ "Content-Type": "application/json" });
  setCookie(headers, "token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 0,
    path: "/",
  });
  return new Response(JSON.stringify({ success: true }), { headers });
};
