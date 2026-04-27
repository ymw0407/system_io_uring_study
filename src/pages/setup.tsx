import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import Setup from '../content/setup.mdx';

const MdxSetup = Setup as MdxComponent;

export default function SetupPage() {
  return (
    <>
      <MdxSetup components={mdxComponents} />
      <PageNav next={{ to: '/part2', label: 'Part 2: C로 직접 구현' }} />
    </>
  );
}
