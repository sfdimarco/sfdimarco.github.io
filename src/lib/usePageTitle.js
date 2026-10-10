import { useEffect } from "react";
import { SHOW_DESCRIPTION, SHOW_TITLE } from "../content/show";
export function usePageTitle(page, description = SHOW_DESCRIPTION) {
  useEffect(() => {
    document.title = page ? `${page} | Mook and Mush` : SHOW_TITLE;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [page, description]);
}
