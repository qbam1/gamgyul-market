// js/api.js
const API_BASE = "https://dev.wenivops.co.kr/services/mandarin";

function getToken() {
  return localStorage.getItem("token");
}
function setToken(token) {
  localStorage.setItem("token", token);
}
function clearToken() {
  localStorage.removeItem("token");
}

/**
 * JSON API 요청
 */
async function apiRequest(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * 이미지 업로드 (multipart/form-data)
 * return: 업로드된 이미지 URL (서버가 준 filename을 URL로 조합)
 */
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/image/uploadfile`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // 명세: info.filename 형태로 내려옴
  const filename = data?.filename || data?.info?.filename;
  if (!filename) throw new Error("이미지 업로드 응답에 filename이 없습니다.");

  // 명세 예시처럼 이미지 URL 구성
  return `${API_BASE}/${filename}`;
}