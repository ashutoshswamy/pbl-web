"use client";
import { useEffect, useState } from "react";

// Rendered in the viewer's own timezone after mount, so server and client output match on hydrate.
export function Time({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }, [iso]);
  return <time dateTime={iso}>{text || " "}</time>;
}
