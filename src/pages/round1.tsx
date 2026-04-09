import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import Motivation from '../content/01-motivation.mdx';
import Background from '../content/02-background.mdx';
import Week1 from '../content/03-week1.mdx';

const MdxMotivation = Motivation as MdxComponent;
const MdxBackground = Background as MdxComponent;
const MdxWeek1 = Week1 as MdxComponent;

export default function Round1() {
  return (
    <>
      <MdxMotivation components={mdxComponents} />
      <MdxBackground components={mdxComponents} />
      <MdxWeek1 components={mdxComponents} />
      <PageNav next={{ to: '/round2', label: 'Round 2: Polling + Workload' }} />
    </>
  );
}
