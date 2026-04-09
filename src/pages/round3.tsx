import { mdxComponents, type MdxComponent } from '../mdxComponents';
import { PageNav } from '../components/PageNav/PageNav';

import Week3 from '../content/05-week3.mdx';
import Adaptive from '../content/06-adaptive.mdx';
import Result from '../content/07-result.mdx';
import Conclusion from '../content/08-conclusion.mdx';

const MdxWeek3 = Week3 as MdxComponent;
const MdxAdaptive = Adaptive as MdxComponent;
const MdxResult = Result as MdxComponent;
const MdxConclusion = Conclusion as MdxComponent;

export default function Round3() {
  return (
    <>
      <MdxWeek3 components={mdxComponents} />
      <MdxAdaptive components={mdxComponents} />
      <MdxResult components={mdxComponents} />
      <MdxConclusion components={mdxComponents} />
      <PageNav prev={{ to: '/round2', label: 'Round 2: Polling + Workload' }} />
    </>
  );
}
