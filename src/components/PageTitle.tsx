import { Fragment, type CSSProperties } from "react";

export function PageTitle({ title, accent }: { title: string; accent?: string }) {
  const first = title.trim().split(/\s+/);
  const second = accent?.trim().split(/\s+/) || [];
  const words = (parts: string[], offset: number) => parts.map((word, index) =>
    <Fragment key={index}>
      {index > 0 && " "}
      <span className="title-word" aria-hidden="true" style={{ "--word-step": Math.min(offset + index, 9) } as CSSProperties}>
        <span>{word}</span>
      </span>
    </Fragment>
  );

  return <h1 aria-label={accent ? title + " " + accent : title}>
    {words(first, 0)}{accent && <> <em>{words(second, first.length)}</em></>}
  </h1>;
}
