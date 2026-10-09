import { Link, useLocation } from "react-router-dom";
import { PAGES, pageUrl } from "./pages";

/**
 * The readout's pages, as a site header's nav, each with the number that
 * opens it.
 *
 * One operator drives the readout from the keyboard while talking, so the keys
 * are written down rather than remembered, and each one is also a link. The
 * page you are on stays in the row, underlined, so the row never shifts and
 * the room can see where the call is.
 */
export function ReadoutNav({ currentWeek }: { currentWeek: number }) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Pages" className="flex h-full items-stretch gap-7">
      {PAGES.map((page) => {
        const current = pathname === page.path;

        return (
          <Link
            key={page.path}
            to={pageUrl(page.path, currentWeek)}
            aria-current={current ? "page" : undefined}
            className={`flex items-center gap-2 border-b-[3px] pt-[3px] text-[18px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              current
                ? "border-white font-semibold text-white"
                : "border-transparent text-white/70 hover:text-white"
            }`}
          >
            <kbd
              className={`inline-block min-w-[26px] rounded-[6px] px-[7px] text-center font-sans text-[15px] font-bold ${
                current ? "bg-white text-navy" : "bg-white/[0.12] text-white/80"
              }`}
            >
              {page.key}
            </kbd>
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}
