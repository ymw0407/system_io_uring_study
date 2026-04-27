import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import SetupWindows from '../content/setup-windows.mdx';

const MdxSetupWindows = SetupWindows as MdxComponent;

export default function SetupWindowsPage() {
  return (
    <>
      <MdxSetupWindows components={mdxComponents} />
      <PageNav
        prev={{ to: '/setup', label: 'Setup 인덱스' }}
        next={{ to: '/part2', label: 'Part 2: C로 직접 구현' }}
      />
    </>
  );
}
