import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import Week2 from '../content/04-week2.mdx';

const MdxWeek2 = Week2 as MdxComponent;

export default function Round2() {
  return (
    <>
      <MdxWeek2 components={mdxComponents} />
      <PageNav
        prev={{ to: '/round1', label: 'Round 1: Baseline + Interrupt' }}
        next={{ to: '/round3', label: 'Round 3: Adaptive' }}
      />
    </>
  );
}
