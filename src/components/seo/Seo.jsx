import { useEffect } from "react";
import { applySeo } from "../../lib/seo";

/**
 * Route-level SEO. Mount qilingan sahifada meta/title yangilanadi.
 */
function Seo(props) {
  useEffect(() => {
    applySeo(props);
  }, [
    props.title,
    props.description,
    props.path,
    props.image,
    props.type,
    props.keywords,
    props.noindex,
    // jsonLd object identity — stringify for deps
    JSON.stringify(props.jsonLd ?? null),
  ]);

  return null;
}

export default Seo;
