import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import SetupMac from '../content/setup-mac.mdx';

const MdxSetupMac = SetupMac as MdxComponent;

export default function SetupMacPage() {
  return (
    <>
      <MdxSetupMac components={mdxComponents} />
      <PageNav
        prev={{ to: '/setup', label: 'Setup 인덱스' }}
        next={{ to: '/part2', label: 'Part 2: C로 직접 구현' }}
      />
    </>
  );
}
