import { gql, useQuery } from "@apollo/client";
import classNames from "classnames";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { NavLink } from "react-router-dom";
import { slugify, withHyphens } from "../lib/helpers";

const CHAPTER_QUERY = gql`
  query ChapterQuery {
    chapters {
      id
      number
      title
      sections {
        id
        number
        title
      }
    }
  }
`;

const LoadingSkeleton = () => (
  <div>
    <h1>
      <Skeleton />
    </h1>
    <Skeleton count={4} />
  </div>
);

const Chapters = ({ chapters }) => {
  return (
    <ul className="TableOfContents-chapters">
      {chapters.map((chapter) => {
        const chapterIsNumbered = chapter.number !== null;

        return (
          <li
            className={classNames({ numbered: chapterIsNumbered })}
            key={chapter.id}
          >
            <NavLink
              to={{
                pathname: slugify(chapter),
                state: { chapter, section: chapter.sections[0] },
              }}
              className="TableOfContents-chapter-link"
              activeClassName="active"
              isActive={(math, location) => {
                const rootPath = location.pathname.split("/")[1];
                return rootPath.includes(withHyphens(chapter.title));
              }}
            >
              {chapterIsNumbered && (
                <span className="TableOfContents-chapter-number">
                  {chapter.number}
                </span>
              )}
              {chapter.title}
            </NavLink>
            {chapterIsNumbered && <Sections chapter={chapter} />}
          </li>
        );
      })}
      <li>
        <NavLink className="TableOfContent-reviews-link" to="/reviews">
          Reviews
        </NavLink>
      </li>
    </ul>
  );
};

const Sections = ({ chapter }) => {
  return (
    <ul className="TableOfContents-sections">
      {chapter.sections.map((section) => {
        return (
          <li key={section.id}>
            <NavLink
              to={{
                pathname: slugify(chapter, section),
                state: { chapter, section },
              }}
              className="TableOfContents-section-link"
              activeClassName="active"
            >
              {section.title}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};

export const TableOfContents = () => {
  const { data, loading } = useQuery(CHAPTER_QUERY);

  return (
    <nav className="TableOfContents">
      {loading ? <LoadingSkeleton /> : <Chapters chapters={data.chapters} />}
    </nav>
  );
};
