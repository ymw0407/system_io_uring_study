import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import Motivation from '../content/01-motivation.mdx';
import Background from '../content/02-background.mdx';

const MdxMotivation = Motivation as MdxComponent;
const MdxBackground = Background as MdxComponent;

export default function Part1() {
  return (
    <>
      <MdxMotivation components={mdxComponents} />
      <MdxBackground components={mdxComponents} />
      <PageNav next={{ to: '/part2', label: 'Part 2: C로 직접 구현' }} />
    </>
  );
}
