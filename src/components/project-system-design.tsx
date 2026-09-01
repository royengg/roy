import type { Project } from "@/data/portfolio";
import {
  getProjectSystemDesign,
  type SystemDesignNode,
  type SystemDesignNote,
} from "@/data/project-system-design";

type DiagramNodeProps = {
  node: SystemDesignNode;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

type ConnectorProps = {
  d: string;
  markerId: string;
  label?: string;
  labelX?: number;
  labelY?: number;
};

const roleLabels: Record<SystemDesignNode["role"], string> = {
  client: "client",
  service: "service",
  worker: "async / compute",
  data: "durable state",
  external: "external system",
};

function truncateLabel(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function splitTitle(value: string, maxCharacters: number) {
  const words = value.split(" ");
  const lines: string[] = [];

  for (const word of words) {
    const current = lines.at(-1);
    if (!current || `${current} ${word}`.length > maxCharacters) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${current} ${word}`;
    }
  }

  return lines.slice(0, 2);
}

function DiagramNode({ node, x, y, width, height, label }: DiagramNodeProps) {
  const titleLines = splitTitle(node.title, width < 150 ? 17 : 22);
  const technologies = truncateLabel(node.technologies.slice(0, 2).join(" · "), width < 150 ? 20 : 26);

  return (
    <g className="architecture-node" data-role={node.role}>
      <rect
        className="architecture-node-echo"
        x={x + 2}
        y={y + 2}
        width={width}
        height={height}
        rx="10"
      />
      <rect className="architecture-node-box" x={x} y={y} width={width} height={height} rx="10" />
      <circle className="architecture-node-dot" cx={x + 16} cy={y + 16} r="3" />
      <text className="architecture-node-label" x={x + 25} y={y + 19}>
        {label ?? roleLabels[node.role]}
      </text>
      <text className="architecture-node-title" x={x + 14} y={y + 43}>
        {titleLines.map((line, index) => (
          <tspan key={line} x={x + 14} dy={index === 0 ? 0 : 17}>
            {line}
          </tspan>
        ))}
      </text>
      <text className="architecture-node-tech" x={x + 14} y={y + height - 12}>
        {technologies}
      </text>
    </g>
  );
}

function Connector({
  d,
  markerId,
  label,
  labelX,
  labelY,
}: ConnectorProps) {
  return (
    <g className="architecture-connector">
      <path
        d={d}
        markerEnd={`url(#${markerId})`}
      />
      {label && labelX !== undefined && labelY !== undefined ? (
        <text x={labelX} y={labelY}>{label}</text>
      ) : null}
    </g>
  );
}

function NoteNode({ note, index, x, y }: { note: SystemDesignNote; index: number; x: number; y: number }) {
  const titleLines = splitTitle(note.title, 30);

  return (
    <g className="architecture-note-node">
      <rect x={x} y={y} width="250" height="76" rx="9" />
      <text className="architecture-note-index" x={x + 14} y={y + 20}>
        {String(index + 1).padStart(2, "0")}
      </text>
      <text className="architecture-note-title" x={x + 45} y={y + 20}>
        {titleLines.map((line, lineIndex) => (
          <tspan key={line} x={x + 45} dy={lineIndex === 0 ? 0 : 16}>
            {line}
          </tspan>
        ))}
      </text>
      <text className="architecture-note-copy" x={x + 14} y={y + 60}>
        {truncateLabel(note.description, 54)}
      </text>
    </g>
  );
}

type WalkthroughSection = {
  key: "high-level" | "frontend" | "backend";
  title: string;
  viewBox: string;
  explanation: string;
};

function formatTechnologyList(technologies: string[]) {
  if (technologies.length === 0) return "the project stack";
  if (technologies.length === 1) return technologies[0];

  return `${technologies.slice(0, -1).join(", ")} and ${technologies.at(-1)}`;
}

function getPlainLanguageWalkthrough(
  summary: string,
  flow: SystemDesignNode[],
  notes: SystemDesignNote[],
) {
  const [client, service, processing, data] = flow;
  const clientStack = formatTechnologyList(client.technologies);
  const serviceStack = formatTechnologyList(service.technologies);
  const processingStack = formatTechnologyList(processing.technologies);
  const dataStack = formatTechnologyList(data.technologies);
  const firstDecision = notes[0];
  const secondDecision = notes[1];

  return {
    overview: `${summary} In practical terms, the structure is split into four parts that can change and recover independently. ${client.title}, built with ${clientStack}, is the part people directly interact with. ${service.title} uses ${serviceStack} to check incoming actions and apply the product's rules before anything important changes. ${processing.title} uses ${processingStack} for work that is slower, repeatable, or safer to run away from the immediate request. ${data.title}, backed by ${dataStack}, keeps the records needed after a refresh, a retry, or a new session. This separation keeps the experience responsive for the person using it while giving developers clear boundaries for testing, monitoring, and fixing failures.`,
    sections: [
      {
        key: "high-level",
        title: "High level overview architecture",
        viewBox: "0 10 625 270",
        explanation: `This view shows the shortest complete journey through the product. The action starts in ${client.title}, where ${client.description.toLowerCase()} It is sent to ${service.title} through the diagram's “${client.handoff ?? "request"}” handoff. ${service.description} From there, immediate work can be saved in ${data.title}, while work labelled “${service.handoff ?? "background work"}” moves to ${processing.title}. ${processing.description} ${data.description} For someone using the product, this means the interface can respond without exposing every internal step. For a developer, it means the screen, product rules, background work, and stored data each have a clear owner.`,
      },
      {
        key: "frontend",
        title: "Frontend interaction with the server",
        viewBox: "620 10 580 300",
        explanation: `From the user's point of view, ${client.title} is the product: it displays the current state, collects an action, and shows what happened next. Under the hood, ${clientStack} sends that action together with the identity or session information needed to handle it safely. ${service.title}, running on ${serviceStack}, validates the request, applies the relevant rules, and returns a clear success, error, or updated state. When it needs existing information, it reads from ${data.title}; when the action changes something, it writes the new state back there. Longer work is handed to ${processing.title} so the page does not remain blocked. The interface can then show progress and collect the finished result when it is ready, which makes refreshes and slower network conditions much less disruptive.`,
      },
      {
        key: "backend",
        title: "Backend architecture and flow",
        viewBox: "0 315 1200 445",
        explanation: `This section focuses on the work that continues behind the interface. ${service.title} is the controlled entry point: ${service.description.toLowerCase()} It passes the heavier or retryable steps to ${processing.title}, where ${processing.description.toLowerCase()} Results are checked and written through the data boundary instead of allowing every part of the system to update records in its own way. ${data.title} remains the reliable source of truth because ${data.description.toLowerCase()} The read model at the end prepares that stored information in a form ${client.title} can display without rebuilding the whole process in the browser. Two decisions are especially important here. ${firstDecision.title}: ${firstDecision.description} ${secondDecision.title}: ${secondDecision.description} Together, these choices make failures easier to retry, keep saved state consistent, and let developers change one stage without rewriting the entire product.`,
      },
    ] satisfies WalkthroughSection[],
  };
}

export function ProjectSystemDesign({
  project,
  tabId,
}: {
  project: Project;
  tabId: string;
}) {
  const design = getProjectSystemDesign(project.slug);
  const [client, service, processing, data] = design.flow;
  const walkthrough = getPlainLanguageWalkthrough(design.summary, design.flow, design.notes);
  const titleId = `${tabId}-title`;
  const descriptionId = `${tabId}-description`;
  const markerId = `${tabId}-arrow`;

  return (
    <div className="project-system-design">
      <header className="system-design-intro">
        <h2 id={titleId}>{project.title} architecture</h2>
      </header>

      <div className="architecture-board-scroll" tabIndex={0} aria-label="Scrollable architecture diagram">
        <svg
          className="architecture-board"
          viewBox="0 0 1200 760"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          preserveAspectRatio="xMidYMid meet"
        >
          <desc id={descriptionId}>{design.summary}</desc>
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <pattern id={`${tabId}-dots`} width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.65" />
            </pattern>
          </defs>

          <rect className="architecture-board-dots" width="1200" height="760" fill={`url(#${tabId}-dots)`} />

          <g id={`${tabId}-high-level`} aria-label="High level overview architecture">
            <text className="architecture-section-title" x="255" y="34" textAnchor="middle">
              high level overview architecture
            </text>
            <DiagramNode node={client} x={36} y={86} width={150} height={86} />
            <DiagramNode node={service} x={235} y={86} width={158} height={86} />
            <DiagramNode node={processing} x={445} y={48} width={154} height={86} />
            <DiagramNode node={data} x={445} y={166} width={154} height={86} />
            <Connector
              d="M 186 129 C 203 129, 218 129, 235 129"
              markerId={markerId}
              label={client.handoff}
              labelX={198}
              labelY={116}
            />
            <Connector
              d="M 393 112 C 418 112, 421 91, 445 91"
              markerId={markerId}
              label={service.handoff}
              labelX={401}
              labelY={80}
            />
            <Connector
              d="M 393 143 C 418 143, 421 209, 445 209"
              markerId={markerId}
              label="persist"
              labelX={401}
              labelY={189}
            />
            <Connector
              d="M 522 134 L 522 166"
              markerId={markerId}
              label={processing.handoff}
              labelX={533}
              labelY={153}
            />
          </g>

          <g id={`${tabId}-frontend`} aria-label="Frontend interaction with the server">
            <text className="architecture-section-title" x="905" y="34" textAnchor="middle">
              frontend interaction with the server
            </text>
            <DiagramNode node={client} x={650} y={86} width={160} height={86} label="frontend" />
            <DiagramNode node={service} x={860} y={86} width={160} height={86} label="server" />
            <DiagramNode node={data} x={1060} y={86} width={112} height={86} label="db" />
            <DiagramNode node={processing} x={860} y={204} width={160} height={86} label="background path" />
            <Connector
              d="M 810 111 C 828 111, 842 111, 860 111"
              markerId={markerId}
              label="request + identity"
              labelX={817}
              labelY={98}
            />
            <Connector
              d="M 860 147 C 842 147, 828 147, 810 147"
              markerId={markerId}
              label="state / response"
              labelX={817}
              labelY={164}
            />
            <Connector
              d="M 1020 129 C 1034 129, 1046 129, 1060 129"
              markerId={markerId}
              label="read + write"
              labelX={1027}
              labelY={116}
            />
            <Connector
              d="M 940 172 L 940 204"
              markerId={markerId}
              label={service.handoff}
              labelX={950}
              labelY={194}
            />
            <Connector
              d="M 1020 247 C 1082 247, 1116 222, 1116 172"
              markerId={markerId}
              label={processing.handoff}
              labelX={1040}
              labelY={236}
            />
          </g>

          <g id={`${tabId}-backend`} aria-label="Backend architecture and flow">
            <text className="architecture-section-title architecture-section-title-large" x="270" y="343">
              backend architecture and flow
            </text>
            <path className="architecture-swoop" d="M 18 390 C 160 352, 327 375, 475 393" />
            <path className="architecture-swoop architecture-swoop-secondary" d="M 594 391 C 806 361, 1015 365, 1174 390" />

            <g className="architecture-database">
              <ellipse cx="117" cy="471" rx="72" ry="20" />
              <path d="M 45 471 L 45 624 C 45 651, 189 651, 189 624 L 189 471" />
              <path d="M 45 522 C 45 549, 189 549, 189 522" />
              <path d="M 45 573 C 45 600, 189 600, 189 573" />
              <text className="architecture-database-mark" x="117" y="551" textAnchor="middle">db</text>
              <text className="architecture-database-title" x="117" y="678" textAnchor="middle">
                {data.title}
              </text>
              <text className="architecture-database-tech" x="117" y="696" textAnchor="middle">
                {truncateLabel(data.technologies.join(" · "), 30)}
              </text>
            </g>

            <g className="architecture-boundary">
              <rect x="255" y="408" width="666" height="302" rx="18" />
              <text x="278" y="433">application / domain boundary</text>
            </g>

            <DiagramNode node={service} x={290} y={466} width={176} height={92} />
            <DiagramNode node={processing} x={518} y={466} width={176} height={92} />
            <DiagramNode node={data} x={746} y={466} width={142} height={92} label="state adapter" />
            <NoteNode note={design.notes[0]} index={0} x={290} y={594} />
            <NoteNode note={design.notes[1]} index={1} x={595} y={594} />
            <DiagramNode node={client} x={996} y={510} width={164} height={100} label="read model" />

            <Connector
              d="M 189 506 C 226 506, 251 512, 290 512"
              markerId={markerId}
              label="load current state"
              labelX={202}
              labelY={493}
            />
            <Connector
              d="M 466 512 C 483 512, 500 512, 518 512"
              markerId={markerId}
              label={service.handoff}
              labelX={476}
              labelY={499}
            />
            <Connector
              d="M 694 512 C 711 512, 729 512, 746 512"
              markerId={markerId}
              label={processing.handoff}
              labelX={702}
              labelY={499}
            />
            <Connector
              d="M 888 512 C 935 512, 949 560, 996 560"
              markerId={markerId}
              label="publish result"
              labelX={914}
              labelY={535}
            />
            <Connector
              d="M 817 558 C 817 576, 805 585, 790 594"
              markerId={markerId}
              label="verify"
              labelX={828}
              labelY={580}
            />
            <Connector
              d="M 595 632 C 563 632, 567 632, 540 632"
              markerId={markerId}
              label="retry / recover"
              labelX={548}
              labelY={620}
            />
            <Connector
              d="M 996 588 C 944 684, 254 741, 117 641"
              markerId={markerId}
              label="persist outcome + audit trail"
              labelX={472}
              labelY={725}
            />
            <Connector
              d="M 117 451 C 117 379, 822 350, 1078 510"
              markerId={markerId}
              label="rehydrate client view"
              labelX={535}
              labelY={372}
            />
          </g>
        </svg>
      </div>

      <div className="system-design-walkthrough">
        <p className="system-design-overview">{walkthrough.overview}</p>

        <div className="system-design-section-list">
          {walkthrough.sections.map((section) => (
            <section className="system-design-section" key={section.key}>
              <h3>{section.title}</h3>
              <div
                className="architecture-focused-scroll"
                tabIndex={0}
                aria-label={`Scrollable ${section.title.toLowerCase()} diagram`}
              >
                <svg
                  className="architecture-board architecture-board-focused"
                  data-section={section.key}
                  viewBox={section.viewBox}
                  role="img"
                  aria-label={`${project.title}: ${section.title}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <use href={`#${tabId}-${section.key}`} />
                </svg>
              </div>
              <p>{section.explanation}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
