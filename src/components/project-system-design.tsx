"use client";

import type { Project } from "@/data/portfolio";
import {
  getProjectSystemDesign,
  type SystemDesignNode,
  type SystemDesignNote,
} from "@/data/project-system-design";
import {
  ProjectArchitectureFlow,
  type ArchitectureVariant,
} from "@/components/project-architecture-flow";

type WalkthroughSection = {
  key: Exclude<ArchitectureVariant, "overview">;
  title: string;
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
        explanation: `This view shows the shortest complete journey through the product. The action starts in ${client.title}, where ${client.description.toLowerCase()} It is sent to ${service.title} through the diagram's “${client.handoff ?? "request"}” handoff. ${service.description} From there, immediate work can be saved in ${data.title}, while work labelled “${service.handoff ?? "background work"}” moves to ${processing.title}. ${processing.description} ${data.description} For someone using the product, this means the interface can respond without exposing every internal step. For a developer, it means the screen, product rules, background work, and stored data each have a clear owner.`,
      },
      {
        key: "frontend",
        title: "Frontend interaction with the server",
        explanation: `From the user's point of view, ${client.title} is the product: it displays the current state, collects an action, and shows what happened next. Under the hood, ${clientStack} sends that action together with the identity or session information needed to handle it safely. ${service.title}, running on ${serviceStack}, validates the request, applies the relevant rules, and returns a clear success, error, or updated state. When it needs existing information, it reads from ${data.title}; when the action changes something, it writes the new state back there. Longer work is handed to ${processing.title} so the page does not remain blocked. The interface can then show progress and collect the finished result when it is ready, which makes refreshes and slower network conditions much less disruptive.`,
      },
      {
        key: "backend",
        title: "Backend architecture and flow",
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
  const walkthrough = getPlainLanguageWalkthrough(design.summary, design.flow, design.notes);
  const titleId = `${tabId}-title`;

  return (
    <div className="project-system-design">
      <header className="system-design-intro">
        <h2 id={titleId}>{project.title} architecture</h2>
      </header>

      <ProjectArchitectureFlow
        design={design}
        projectTitle={project.title}
        variant="overview"
      />

      <div className="system-design-walkthrough">
        <p className="system-design-overview">{walkthrough.overview}</p>

        <div className="system-design-section-list">
          {walkthrough.sections.map((section) => (
            <section className="system-design-section" key={section.key}>
              <h3>{section.title}</h3>
              <ProjectArchitectureFlow
                design={design}
                projectTitle={project.title}
                variant={section.key}
              />
              <p>{section.explanation}</p>
            </section>
          ))}
        </div>

        <section className="system-design-decision-section">
          <h3>Key decisions and trade-offs</h3>
          <div className="system-design-decision-grid">
            {design.notes.map((note) => (
              <article className="system-design-decision-card" key={note.title}>
                <span>{note.kicker}</span>
                <h4>{note.title}</h4>
                <p>{note.description}</p>
                <p className="system-design-tradeoff">
                  <strong>Trade-off</strong>
                  {note.tradeoff}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="system-design-operations-section">
          <h3>Reliability and trust</h3>
          <dl className="system-design-operations-list">
            {design.operations.map((item) => (
              <div key={item.kicker}>
                <dt>
                  <span>{item.kicker}</span>
                  <strong>{item.title}</strong>
                </dt>
                <dd>{item.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
