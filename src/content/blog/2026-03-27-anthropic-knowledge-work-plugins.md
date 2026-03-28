---
title: "Anthropic's Knowledge Work Plugins: The 10 Essential Tools for Modern Tech Teams"
pubDate: 2026-03-27
description: "I tested Anthropic's official Claude plugins for knowledge workers. Here are the 10 that deliver the most value for PMs, engineers, sales teams, and operators."
category: code
draft: false
---

I spend most of my day in Claude Code. It's become the center of gravity for how I build — coding, writing, researching, planning. So when Anthropic dropped their [official knowledge work plugins](https://github.com/anthropics/knowledge-work-plugins) earlier this year, I installed all of them immediately.

These aren't toy extensions. They're full domain experts packaged as file-based bundles — skills, slash commands, and MCP connectors that turn Claude from a general-purpose assistant into a specialized colleague who understands your role, your tools, and your workflows.

After living with these for a few weeks, here are the **10 most valuable plugins** for tech workers — whether you're a PM, engineer, sales lead, or founder wearing all those hats.

---

## 1. Productivity — The Foundation

**Who it's for:** Everyone. Seriously.

This plugin seems basic until you realize how much mental overhead it eliminates. It manages two things: **tasks** and **memory**.

The task management skill uses a simple `TASKS.md` file with sections for Active, Waiting On, Someday, and Done. No complex project management tool required. The memory skill maintains a two-tier system: `CLAUDE.md` for hot context (current projects, recent decisions) and a `memory/` directory for deep storage (company terminology, relationships, historical context).

**The killer feature:** Claude decodes your workplace shorthand automatically. Those acronyms and internal codenames that new hires struggle with? Claude learns them and translates silently.

**Key commands:**
- `/productivity:start` — Bootstraps your task and memory systems from your existing calendar, email, and documents
- `/productivity:update` — Syncs tasks from external sources and triages stale items

**Connectors:** Slack, Notion, Asana, Linear, Jira, Monday, ClickUp, Microsoft 365

---

## 2. Sales — Your Pipeline Co-Pilot

**Who it's for:** Account executives, SDRs, founders doing sales

I've watched sales teams spend hours researching prospects before calls. This plugin compresses that into minutes. It researches companies and people, drafts personalized outreach with multiple subject line options, and builds competitive battlecards you can actually use.

**The killer feature:** Call prep. Give it a meeting attendee list and it returns full dossiers: company context, recent news, talking points, discovery questions, and relationship history from your CRM.

**Key commands:**
- `/sales:call-prep` — Full meeting preparation with attendee research
- `/sales:pipeline-review` — Analyzes pipeline by stage, surfaces stalled deals
- `/sales:forecast` — Builds forecast with opportunity review and risk assessment

**Connectors:** HubSpot, Close, Clay, ZoomInfo, Notion, Fireflies, Apollo, Outreach

---

## 3. Product Management — From Idea to Spec

**Who it's for:** Product managers, technical founders, anyone writing PRDs

Writing a good feature spec is tedious. This plugin structures the thinking for you — problem statements, user stories, MoSCoW requirements, success metrics, and open questions. It also synthesizes user research, tracks competitive landscapes, and manages roadmaps using RICE or ICE frameworks.

**The killer feature:** The feature spec skill doesn't just give you a template. It asks the right questions, challenges weak problem statements, and ensures you're shipping solutions, not features.

**Key commands:**
- `/pm:write-spec` — Creates a complete PRD with problem, goals, user stories, and metrics
- `/pm:synthesize-research` — Analyzes user interview transcripts for patterns and insights
- `/pm:stakeholder-update` — Drafts roadmap updates that executives actually want to read

**Connectors:** Linear, Asana, Jira, Notion, Figma, Amplitude, Pendo, Intercom, Fireflies

---

## 4. Engineering — Kill the Process Toil

**Who it's for:** Software engineers, tech leads, anyone on-call

This one's newer (dropped in February 2026) and immediately became essential. It handles the documentation burden that engineers hate: standup summaries, incident postmortems, runbooks, and deployment checklists.

**The killer feature:** Incident response. During an outage, you need to coordinate, communicate, and document simultaneously. This plugin structures the timeline, drafts the postmortem as you go, and ensures nothing falls through the cracks.

**Key commands:**
- `/engineering:standup` — Generates update from recent commits and tickets
- `/engineering:incident-response` — Structures timeline and drafts postmortem
- `/engineering:write-runbook` — Creates operational docs from verbal descriptions

**Connectors:** GitHub, Linear, Jira, PagerDuty, Datadog, Slack, Notion

---

## 5. Data — SQL Without the Context Switching

**Who it's for:** Data analysts, engineers writing queries, PMs who need insights

If you work with data warehouses, this plugin eliminates the tool-hopping. It writes SQL, runs statistical analysis, builds visualizations, and validates results before you share them with stakeholders.

**The killer feature:** Claude validates its own work. It double-checks query logic, sample sizes, and statistical significance before presenting conclusions. No more "wait, that number seems off" moments in executive reviews.

**Key commands:**
- `/data:write-query` — Generates SQL with explanations
- `/data:validate-analysis` — Checks for common statistical errors
- `/data:build-dashboard` — Creates visualization recommendations

**Connectors:** Snowflake, Databricks, BigQuery, Definite, Hex, Amplitude

---

## 6. Marketing — Content at Scale

**Who it's for:** Growth marketers, content creators, founders doing marketing

Creating content that actually converts requires balancing brand voice, SEO, and channel constraints. This plugin drafts blog posts, social content, newsletters, and landing pages while enforcing your brand guidelines.

**The killer feature:** Brand voice management. Define your voice once (witty but professional, technical but accessible, whatever your brand is) and Claude applies it consistently across every piece of content.

**Key commands:**
- `/marketing:draft-content` — Generates content with brand voice applied
- `/marketing:campaign-plan` — Plans integrated campaigns with audience, messaging, timeline
- `/marketing:seo-audit` — Technical SEO review with recommendations

**Connectors:** Canva, Figma, HubSpot, Amplitude, Notion, Ahrefs, SimilarWeb, Klaviyo

---

## 7. Customer Support — Turn Tickets into Knowledge

**Who it's for:** Support teams, customer success, technical account managers

Support work is a treadmill: answer ticket, answer ticket, answer ticket. This plugin triages incoming requests, drafts empathetic responses, and — crucially — turns resolved issues into knowledge base articles so you stop answering the same question twice.

**The killer feature:** Knowledge management. After resolving a ticket, one command turns the conversation into a KB article, FAQ entry, or how-to guide. Your future self (and your team) will thank you.

**Key commands:**
- `/support:triage` — Categorizes and prioritizes incoming tickets
- `/support:draft-response` — Crafts professional, context-aware replies
- `/support:kb-article` — Creates knowledge base content from resolved issues

**Connectors:** Intercom, HubSpot, Guru, Jira, Notion

---

## 8. Enterprise Search — Find Anything, Everywhere

**Who it's for:** Anyone who's ever spent 20 minutes looking for a document

The modern workplace is a sprawl: Slack threads, Notion pages, Google Docs, Confluence, email threads. This plugin searches across all of them simultaneously with a single query.

**The killer feature:** It understands context, not just keywords. "Find the Q4 planning doc Sarah mentioned in Slack" actually works. It connects references across platforms and surfaces the most relevant result.

**Key commands:**
- Just ask naturally. "What was our decision on the auth architecture?" or "Find the contract renewal discussion with Acme Corp"

**Connectors:** Slack, Notion, Guru, Jira, Asana, Microsoft 365, Google Workspace

---

## 9. Design — UX Copy and Accessibility

**Who it's for:** Product designers, UX writers, PMs who touch design

Designers should design, not write interface copy or audit for accessibility. This plugin handles the parts of design work that slow teams down: microcopy, error messages, empty states, and WCAG compliance checks.

**The killer feature:** UX writing. Give it a flow or component description and it generates appropriate copy — button labels, form instructions, error messages — that matches your product's tone.

**Key commands:**
- `/design:ux-copy` — Generates interface copy for flows and components
- `/design:accessibility-audit` — Checks designs against WCAG standards
- `/design:design-doc` — Writes design documentation from Figma files

**Connectors:** Figma, Notion, Slack, Jira, Linear

---

## 10. Legal — Contract Review Without the Billable Hours

**Who it's for:** Founders, operations leads, anyone reviewing contracts

Legal review is expensive and slow. This plugin triages NDAs, reviews contracts for key terms and risks, and drafts templated responses. It's not a replacement for counsel, but it handles the routine stuff that doesn't need a lawyer's eye.

**The killer feature:** Contract review with risk assessment. It flags unusual terms, missing standard protections, and potential issues before you send it to your lawyer — saving everyone time and money.

**Key commands:**
- `/legal:contract-review` — Reviews agreements for key terms and risks
- `/legal:triage-nda` — Quick assessment of standard NDAs
- `/legal:compliance-check` — Navigates regulatory requirements

**Connectors:** Box, Egnyte, DocuSign, Jira, Microsoft 365

---

## How to Get Started

Installing these takes two commands:

```bash
# Add the marketplace
claude plugin marketplace add anthropics/knowledge-work-plugins

# Install specific plugins
claude plugin install productivity@knowledge-work-plugins
claude plugin install sales@knowledge-work-plugins
claude plugin install product-management@knowledge-work-plugins
```

Once installed, plugins activate automatically. Skills fire when relevant, and slash commands are available in your session.

---

## The Real Power: Customization

These plugins are starting points. The real value comes from customizing them for your company:

- **Swap connectors** — Edit `.mcp.json` to point at your specific tool stack
- **Add company context** — Drop your terminology, org structure, and processes into skill files
- **Adjust workflows** — Modify skill instructions to match how your team actually works

Every component is file-based — markdown and JSON. No code, no infrastructure, no build steps. Fork the repo, make your changes, and you're done.

---

## The Bottom Line

AI tools are commoditizing fast. Everyone has access to the same models. What differentiates teams is **context** — how effectively you encode your institutional knowledge into the tools you use every day.

These plugins give you a framework for doing exactly that. They turn Claude from a generalist into a specialist who understands your business, your workflows, and your tools.

If you're building in Claude Code or Claude Cowork, install these. Start with Productivity and the plugin for your primary role. Customize them. Iterate. The teams that figure this out first will have an unfair advantage.

The future of work isn't AI replacing humans. It's humans with contextualized AI replacing humans without it.

---

**Related:**
- [Anthropic's knowledge-work-plugins on GitHub](https://github.com/anthropics/knowledge-work-plugins)
- [My ACP SDK for building agent teams](/blog/2026-03-06-build-your-own-agent-team)
- [Loooom — My Claude Code plugin marketplace](https://loooom.xyz)