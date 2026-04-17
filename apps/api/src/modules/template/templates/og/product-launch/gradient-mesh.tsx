import type { ReactElement } from "react";
import { Box } from "../../layout";
import { withAlpha } from "../../utils";

export function GradientMesh(props: { accent: string; strong: string }): ReactElement {
  const { accent, strong } = props;
  return (
    <>
      <Box
        absolute
        top={-180}
        left={-120}
        width={780}
        height={780}
        style={{
          borderRadius: "999px",
          background: `radial-gradient(circle, ${withAlpha(accent, 0.42)} 0%, rgba(0,0,0,0) 62%)`,
        }}
      />
      <Box
        absolute
        bottom={-260}
        right={-120}
        width={820}
        height={820}
        style={{
          borderRadius: "999px",
          background: `radial-gradient(circle, ${withAlpha(strong, 0.5)} 0%, rgba(0,0,0,0) 62%)`,
        }}
      />
      <Box
        absolute
        top={180}
        right={280}
        width={420}
        height={420}
        style={{
          borderRadius: "999px",
          background: `radial-gradient(circle, ${withAlpha(accent, 0.3)} 0%, rgba(0,0,0,0) 65%)`,
        }}
      />
    </>
  );
}
