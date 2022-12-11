import { Dispatch, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useScrollYPosition } from "react-use-scroll-position/index";
import { useRouter } from "next/router";

const ContentsList = () => {
  const { nestedHeadings, headingElements } = useHeadingsData();
  const [activeId, setActiveId] = useState(0);
  useIntersectionObserver(setActiveId, headingElements);

  return (
    <>
      <pre className={"mb-1"}>Spis treści</pre>
      <ul>
        {nestedHeadings.map((heading, index) => {
          return (
            <li key={`#${heading.id}`}>
              <div
                style={{ marginLeft: "-0.75rem" }}
                className={
                  "h-7 cursor-pointer border-blue-400 flex items-center pl-3 box-content pr-2 rounded " +
                  (activeId == heading.id ? "bg-slate-100 border-l-4" : "")
                }
                onClick={(e) => {
                  e.preventDefault();
                  document
                    ?.getElementById(`h-${heading.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <p className={"truncate"}>{heading.title.replace("#", "")}</p>
              </div>
              {heading.items.map((item) => (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      ?.getElementById(`h-${item.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  style={{ marginLeft: "-0.75rem" }}
                  className={
                    "h-7 cursor-pointer border-blue-400 flex items-center pl-3 box-content pr-2 rounded " +
                    (activeId == item.id ? "bg-slate-100 border-l-4" : "")
                  }
                >
                  <p className={"truncate ml-2"}>
                    {item.title.replace("#", "")}
                  </p>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default ContentsList;

const useHeadingsData = () => {
  const [nestedHeadings, setNestedHeadings] = useState([]);
  const [headingElements, setHeadingElements] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2, h3"));
    for (const heading of headings) {
      const id = heading.textContent
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s/g, "-")
        .replace(/ł/g, "l")
        .replace(/./g, "")
        .replace(/,/g, "")
        .replace(/#/g, "");

      heading.id = `${id}`;
      const anchor = document.getElementById(`h-${id}`);
      if (anchor) {
        anchor.style.visibility = "hidden";
        anchor.style.position = "absolute";
        anchor.style.marginTop = "-4rem";
      }
    }

    setNestedHeadings(getNestedHeadings(headings));
    setHeadingElements(headings);
  }, [router.pathname]);

  return { nestedHeadings, headingElements };
};

const getNestedHeadings = (headings) => {
  const nestedHeadings = [];

  headings.forEach((heading, index) => {
    const { textContent, id } = heading;

    if (heading.nodeName === "H2") {
      nestedHeadings.push({ id, title: textContent, items: [] });
    } else if (heading.nodeName === "H3" && nestedHeadings.length > 0) {
      nestedHeadings[nestedHeadings.length - 1].items.push({
        id,
        title: textContent,
      });
    }
  });

  return nestedHeadings;
};

const useIntersectionObserver = (setActiveId, headingElements) => {
  const headingElementsRef = useRef({});

  useEffect(() => {
    const callback = (headings) => {
      headingElementsRef.current = headings.reduce((map, headingElement) => {
        map[headingElement.target.id] = headingElement;
        return map;
      }, headingElementsRef.current);

      const visibleHeadings = [];
      Object.keys(headingElementsRef.current).forEach((key) => {
        const headingElement = headingElementsRef.current[key];
        if (headingElement.isIntersecting) visibleHeadings.push(headingElement);
      });

      const getIndexFromId = (id) =>
        headingElements.findIndex((heading) => heading.id === id);

      if (visibleHeadings.length === 1) {
        setActiveId(visibleHeadings[0].target.id);
      } else if (visibleHeadings.length > 1) {
        const sortedVisibleHeadings = visibleHeadings.sort(
          (a, b) => getIndexFromId(a.target.id) > getIndexFromId(b.target.id)
        );
        setActiveId(sortedVisibleHeadings[0].target.id);
      }
    };

    const rem = getComputedStyle(document.documentElement).fontSize;

    const value = `-${
      4 * parseInt(rem.substring(0, rem.length - 2))
    }px 0px 0px 0px`;

    const observer = new IntersectionObserver(callback, {
      rootMargin: value,
    });

    headingElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [setActiveId, headingElements]);
};

export const headingToId = (heading) =>
  heading
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "-")
    .replace(/ł/g, "l")
    .replace(/./g, "")
    .replace(/,/g, "")
    .replace(/#/g, "");
