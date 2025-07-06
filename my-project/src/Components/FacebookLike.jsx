import { FacebookProvider, Like } from "react-facebook";

export default function FacebookLike() {

  const VITE_FB_LIKE_PIN = import.meta.env.VITE_FB_LIKE_PIN;

  return (
    <FacebookProvider appId={VITE_FB_LIKE_PIN} language="sv_SE">
      <Like
        href="https://www.facebook.com/profile.php?id=61555396035366"
        layout="button_count"
        action="like"
        showFaces={false}
        share={false}
        size="large"
      />
    </FacebookProvider>
  );
}
