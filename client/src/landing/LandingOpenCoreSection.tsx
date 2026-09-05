import { useLayoutEffect, useRef, useState } from "react";
import { BorderBeam } from "border-beam";
import { IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import {
  COLUMNS,
  OPEN_CORE_COPY,
  ROWS,
  SHOTOKU_PROOF,
  type CellValue,
  type ColumnId,
} from "./open-core/data";
import "./open-core/open-core.css";

const HOSTED_RADIUS = 12;

function Cell({ value }: { value: CellValue }) {
  if (value.kind === "check") {
    return (
      <span className="landing-open-core-compare__mark landing-open-core-compare__mark--yes">
        <IconCheck size={18} stroke={1.75} aria-hidden />
        <span className="landing-open-core-compare__sr">Yes</span>
      </span>
    );
  }
  if (value.kind === "missing") {
    return (
      <span className="landing-open-core-compare__missing" aria-label="Not available">
        {value.value}
      </span>
    );
  }
  if (value.kind === "cross") {
    return (
      <span className="landing-open-core-compare__mark landing-open-core-compare__mark--no">
        <IconX size={18} stroke={1.75} aria-hidden />
        <span className="landing-open-core-compare__sr">No</span>
      </span>
    );
  }
  return (
    <span
      className={[
        "landing-open-core-compare__text",
        value.muted && "landing-open-core-compare__text--muted",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {value.value}
    </span>
  );
}

function cellFor(columnId: ColumnId, row: (typeof ROWS)[number]): CellValue {
  return row[columnId];
}

type BeamBox = { top: number; left: number; width: number; height: number };

/** Quiet table compare — Cappr hosted column carries the border beam. */
export function LandingOpenCoreSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [beamBox, setBeamBox] = useState<BeamBox | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const table = tableRef.current;
    if (!wrap || !table) return;

    const update = () => {
      const cells = table.querySelectorAll<HTMLElement>(
        ".landing-open-core-compare__th--hosted, .landing-open-core-compare__td--hosted",
      );
      if (cells.length === 0) return;
      const wrapRect = wrap.getBoundingClientRect();
      const first = cells[0].getBoundingClientRect();
      const last = cells[cells.length - 1].getBoundingClientRect();
      setBeamBox({
        top: first.top - wrapRect.top + wrap.scrollTop,
        left: first.left - wrapRect.left + wrap.scrollLeft,
        width: first.width,
        height: last.bottom - first.top,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(table);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section
      id="open-core"
      className="landing-open-core landing-grid"
      aria-labelledby="landing-open-core-title"
    >
      <div className="landing-grid__gutter" aria-hidden />
      <div className="landing-open-core__frame">
        <header className="landing-open-core__header">
          <h2 id="landing-open-core-title" className="landing-open-core__title">
            {OPEN_CORE_COPY.titleLine1}
            {OPEN_CORE_COPY.titleLine2 ? <><br />{OPEN_CORE_COPY.titleLine2}</> : null}
          </h2>
          <p className="landing-open-core__lead">{OPEN_CORE_COPY.lead}</p>
        </header>

        <div
          className="landing-open-core-compare"
          role="region"
          aria-label="Provider billing alone versus Cappr hosted versus Cappr on your infra"
        >
          <div className="landing-open-core-compare__scroll">
            <div ref={wrapRef} className="landing-open-core-compare__table-wrap">
              <table ref={tableRef} className="landing-open-core-compare__table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="landing-open-core-compare__sr">Feature</span>
                    </th>
                    {COLUMNS.map((column) => (
                      <th
                        key={column.id}
                        scope="col"
                        className={[
                          column.id === "hosted" && "landing-open-core-compare__th--hosted",
                          column.id === "none" && "landing-open-core-compare__th--none",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span className="landing-open-core-compare__col-title">{column.title}</span>
                        <span className="landing-open-core-compare__col-sub">{column.subtitle}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row">{row.feature}</th>
                      {COLUMNS.map((column) => (
                        <td
                          key={column.id}
                          className={[
                            column.id === "hosted" && "landing-open-core-compare__td--hosted",
                            column.id === "none" && "landing-open-core-compare__td--none",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <Cell value={cellFor(column.id, row)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">
                      <span className="landing-open-core-compare__sr">Actions</span>
                    </th>
                    {COLUMNS.map((column) => (
                      <td
                        key={column.id}
                        className={[
                          column.id === "hosted" && "landing-open-core-compare__td--hosted",
                          column.id === "none" && "landing-open-core-compare__td--none",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {column.cta ? (
                          <a
                            href={column.cta.href}
                            className={[
                              "landing-cta",
                              column.id === "hosted" ? "landing-cta--primary" : "landing-cta--secondary",
                            ].join(" ")}
                          >
                            {column.cta.label}
                            {column.id === "hosted" ? (
                              <IconArrowRight
                                size={14}
                                stroke={1.75}
                                aria-hidden
                                className="landing-cta__arrow"
                              />
                            ) : null}
                          </a>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>

              {beamBox ? (
                <div
                  className="landing-open-core-compare__beam"
                  style={{
                    top: beamBox.top,
                    left: beamBox.left,
                    width: beamBox.width,
                    height: beamBox.height,
                  }}
                  aria-hidden
                >
                  <BorderBeam
                    className="landing-open-core-compare__beam-inner"
                    size="md"
                    colorVariant="ocean"
                    theme="auto"
                    strength={0.32}
                    duration={2.8}
                    borderRadius={HOSTED_RADIUS}
                  >
                    <div
                      className="landing-open-core-compare__beam-shell"
                      style={{ borderRadius: HOSTED_RADIUS }}
                    />
                  </BorderBeam>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <p className="landing-open-core__proof">
          <a
            href={SHOTOKU_PROOF.href}
            className="landing-open-core__proof-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shotoku
          </a>{" "}
          is open source
          <span aria-hidden> · </span>
          Inspect the gateway Cappr runs on.
        </p>
      </div>
      <div className="landing-grid__gutter" aria-hidden />
    </section>
  );
}
