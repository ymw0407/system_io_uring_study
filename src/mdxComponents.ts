import type { ComponentType } from 'react';
import { Section } from './components/Section/Section';
import { CodeBlock } from './components/CodeBlock/CodeBlock';
import { Chart } from './components/Chart/Chart';
import { Callout } from './components/Callout/Callout';
import { Terminal } from './components/Terminal/Terminal';
import { Steps, Step } from './components/Steps/Steps';

export const mdxComponents: Record<string, ComponentType> = {
  Section: Section as ComponentType,
  CodeBlock: CodeBlock as ComponentType,
  Chart: Chart as ComponentType,
  Callout: Callout as ComponentType,
  Terminal: Terminal as ComponentType,
  Steps: Steps as ComponentType,
  Step: Step as ComponentType,
};

export type MdxComponent = ComponentType<{ components?: Record<string, ComponentType> }>;
