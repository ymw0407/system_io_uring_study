import type { ComponentType } from 'react';
import { Section } from './components/Section/Section';
import { CodeBlock } from './components/CodeBlock/CodeBlock';
import { Chart } from './components/Chart/Chart';
import { Callout } from './components/Callout/Callout';
import { Terminal } from './components/Terminal/Terminal';
import { Steps, Step } from './components/Steps/Steps';
import { InterruptFlow } from './components/InterruptFlow/InterruptFlow';
import { LatencyInversion } from './components/LatencyInversion/LatencyInversion';
import { RingBufferDiagram } from './components/RingBufferDiagram/RingBufferDiagram';
import { PollingTargets } from './components/PollingTargets/PollingTargets';
import { CostAxis } from './components/CostAxis/CostAxis';
import { IoApiMatrix } from './components/IoApiMatrix/IoApiMatrix';
import { StepSection } from './components/StepSection/StepSection';
import { StepCard } from './components/StepCard/StepCard';
import { MdxLink } from './components/MdxLink/MdxLink';

export const mdxComponents: Record<string, ComponentType> = {
  Section: Section as ComponentType,
  CodeBlock: CodeBlock as ComponentType,
  Chart: Chart as ComponentType,
  Callout: Callout as ComponentType,
  Terminal: Terminal as ComponentType,
  Steps: Steps as ComponentType,
  Step: Step as ComponentType,
  InterruptFlow: InterruptFlow as ComponentType,
  LatencyInversion: LatencyInversion as ComponentType,
  RingBufferDiagram: RingBufferDiagram as ComponentType,
  PollingTargets: PollingTargets as ComponentType,
  CostAxis: CostAxis as ComponentType,
  IoApiMatrix: IoApiMatrix as ComponentType,
  StepSection: StepSection as ComponentType,
  StepCard: StepCard as ComponentType,
  a: MdxLink as ComponentType,
};

export type MdxComponent = ComponentType<{ components?: Record<string, ComponentType> }>;
