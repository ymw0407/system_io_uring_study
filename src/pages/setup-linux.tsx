import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import SetupLinux from '../content/setup-linux.mdx';

const MdxSetupLinux = SetupLinux as MdxComponent;

export default function SetupLinuxPage() {
  return (
    <>
      <MdxSetupLinux components={mdxComponents} />
      <PageNav
        prev={{ to: '/setup', label: 'Setup 인덱스' }}
        next={{ to: '/part2', label: 'Part 2: C로 직접 구현' }}
      />
    </>
  );
}
