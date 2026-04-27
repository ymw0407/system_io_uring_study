import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import Week1 from '../content/03-week1.mdx';

const MdxWeek1 = Week1 as MdxComponent;

export default function Part2() {
  return (
    <>
      <MdxWeek1 components={mdxComponents} />
      <PageNav
        prev={{ to: '/part1', label: 'Part 1: 도입과 배경' }}
        next={{ to: '/part3', label: 'Part 3: fio로 정밀 측정' }}
      />
    </>
  );
}
