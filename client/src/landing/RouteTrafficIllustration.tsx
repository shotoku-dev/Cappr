import { BorderBeam } from "border-beam";
import CapprLogo from "../assets/brand/cappr-logo.svg?react";
import SingleAgentIcon from "../assets/icons/Single Agent Icon.svg?react";

const AGENT_ICON_SIZE = 16;
const AGENT_PILL_HEIGHT = 20;
const AGENT_PILL_RADIUS = AGENT_PILL_HEIGHT;
const CAPPR_Y = 0;
const CAPPR_SIZE = 32;
const PROVIDER_Y = 88;
const CONNECTOR_TOP_Y = -40;
const CONNECTOR_BEND_Y = 56;
const CONNECTOR_CORNER_RADIUS = 4;
const PROVIDER_NODE_HEIGHT = 15;
const CONNECTOR_OUTPUT_GAP = 4;
const VIEWBOX_TOP = CONNECTOR_TOP_Y - 4;
const VIEWBOX_HEIGHT = PROVIDER_Y + PROVIDER_NODE_HEIGHT + 8 - VIEWBOX_TOP;

const PROVIDER_NODES = [
  { label: "Model", centerX: 55, width: 36 },
  { label: "Tool", centerX: 100, width: 30 },
  { label: "Pay", centerX: 145, width: 28 },
] as const;

function ProviderNode({
  centerX,
  y,
  width,
  height,
  label,
}: {
  centerX: number;
  y: number;
  width: number;
  height: number;
  label: string;
}) {
  return (
    <foreignObject
      x={centerX - width / 2}
      y={y}
      width={width}
      height={height}
      className="route-traffic-illus__node"
    >
      <div className="route-traffic-illus__output">
        <span className="route-traffic-illus__output-label">{label}</span>
      </div>
    </foreignObject>
  );
}

function DottedConnector({ d }: { d: string }) {
  return <path className="route-traffic-illus__line" d={d} fill="none" vectorEffect="non-scaling-stroke" />;
}

function StraightConnector({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return <DottedConnector d={`M ${x1} ${y1} L ${x2} ${y2}`} />;
}

function ElbowConnector({
  startX,
  startY,
  endX,
  endY,
  bendY = CONNECTOR_BEND_Y,
  cornerRadius = CONNECTOR_CORNER_RADIUS,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  bendY?: number;
  cornerRadius?: number;
}) {
  const r = cornerRadius;
  const goingLeft = endX < startX;

  const d = goingLeft
    ? [
        `M ${startX} ${startY}`,
        `L ${startX} ${bendY - r}`,
        `Q ${startX} ${bendY} ${startX - r} ${bendY}`,
        `L ${endX + r} ${bendY}`,
        `Q ${endX} ${bendY} ${endX} ${bendY + r}`,
        `L ${endX} ${endY}`,
      ].join(" ")
    : [
        `M ${startX} ${startY}`,
        `L ${startX} ${bendY - r}`,
        `Q ${startX} ${bendY} ${startX + r} ${bendY}`,
        `L ${endX - r} ${bendY}`,
        `Q ${endX} ${bendY} ${endX} ${bendY + r}`,
        `L ${endX} ${endY}`,
      ].join(" ");

  return <DottedConnector d={d} />;
}

function CapprMark({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <foreignObject x={x} y={y} width={size} height={size} className="route-traffic-illus__cappr">
      <div className="route-traffic-illus__cappr-mark">
        <CapprLogo width={size} height={size} aria-hidden />
      </div>
    </foreignObject>
  );
}

export function RouteTrafficIllustration() {
  const capprBottom = CAPPR_Y + CAPPR_SIZE;
  const connectorEndY = PROVIDER_Y - CONNECTOR_OUTPUT_GAP;

  return (
    <div className="route-traffic-illus">
      <BorderBeam
        className="route-traffic-illus__agent-beam"
        size="sm"
        colorVariant="ocean"
        theme="auto"
        strength={0.65}
        duration={2.8}
        borderRadius={AGENT_PILL_RADIUS}
      >
        <div className="route-traffic-illus__agent-pill">
          <SingleAgentIcon width={AGENT_ICON_SIZE} height={AGENT_ICON_SIZE} aria-hidden />
          <span>agent-alpha</span>
        </div>
      </BorderBeam>
      <svg
        viewBox={`0 ${VIEWBOX_TOP} 200 ${VIEWBOX_HEIGHT}`}
        className="route-traffic-illus__svg"
        style={{ aspectRatio: `200 / ${VIEWBOX_HEIGHT}` }}
        preserveAspectRatio="xMidYMin meet"
        role="img"
        aria-label="agent-alpha traffic flows down through Cappr to providers"
      >
        <StraightConnector x1={100} y1={CONNECTOR_TOP_Y} x2={100} y2={CAPPR_Y} />
        <CapprMark x={84} y={CAPPR_Y} size={CAPPR_SIZE} />
        <ElbowConnector startX={100} startY={capprBottom} endX={55} endY={connectorEndY} />
        <StraightConnector x1={100} y1={capprBottom} x2={100} y2={connectorEndY} />
        <ElbowConnector startX={100} startY={capprBottom} endX={145} endY={connectorEndY} />
        {PROVIDER_NODES.map(({ label, centerX, width }) => (
          <ProviderNode
            key={label}
            centerX={centerX}
            y={PROVIDER_Y}
            width={width}
            height={PROVIDER_NODE_HEIGHT}
            label={label}
          />
        ))}
      </svg>
    </div>
  );
}
