import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

const EXTERNAL_PROTOCOL = /^(https?:|mailto:|tel:|#)/i;

export function MdxLink({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) {
    return <a {...props}>{children}</a>;
  }

  if (EXTERNAL_PROTOCOL.test(href)) {
    const isHttp = href.startsWith('http');
    return (
      <a
        href={href}
        target={isHttp ? '_blank' : undefined}
        rel={isHttp ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  );
}
