import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import Week2 from '../content/04-week2.mdx';

const MdxWeek2 = Week2 as MdxComponent;

export default function Part3() {
  return (
    <>
      <MdxWeek2 components={mdxComponents} />
      <PageNav
        prev={{ to: '/part2', label: 'Part 2: C로 직접 구현' }}
        next={{ to: '/part4', label: 'Part 4: Adaptive 구현' }}
      />
    </>
  );
}
