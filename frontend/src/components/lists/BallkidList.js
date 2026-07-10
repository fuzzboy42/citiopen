import React, { useState, useEffect, useMemo } from "react";

import {
  LayoutButtons,
  SearchAndFilter,
  filterBallkids,
  getAuthHeader,
  getLocalStorage,
  BallkidCard,
  HelpIcon,
  Banners,
} from "../Utils";
import { list, listNonchairperson } from "../HelpMessages";
import "./ballkid-list.css";

export default function BallkidList(props) {
  const [ballkids, setBallkids] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterGroup, setFilterGroup] = useState();
  const [layout, setLayout] = useState(getLocalStorage("layout") ?? "list");

  const group = getLocalStorage("group");
  const filters = ["captain", "chairperson", "back", "net"];

  useEffect(() => {
    fetch("/api/list", { headers: getAuthHeader() })
      .then((response) => response.json())
      .then((data) =>
        setBallkids(data.filter((ballkid) => ballkid.is_cut === false))
      );
  }, []);

  const filtered = useMemo(
    () => filterBallkids(ballkids, searchKeyword, filterGroup),
    [ballkids, searchKeyword, filterGroup]
  );

  return (
    <div className="page list-by-name-shell">
      <Banners />

      <div className="list-by-name-page">
        <header className="list-by-name-header">
          <div className="list-by-name-title-row">
            <h1 className="list-by-name-title">List by Name</h1>
            <span className="list-by-name-count">{filtered.length}</span>
            <HelpIcon
              page="List By Name"
              message={group === "chairperson" ? list : listNonchairperson}
            />
          </div>
          {ballkids.length > 0 ? (
            <LayoutButtons layout={layout} setLayout={setLayout} />
          ) : null}
        </header>

        {ballkids.length === 0 ? (
          <p className="list-by-name-empty">There are no ballkids to show.</p>
        ) : (
          <>
            <div className="list-by-name-toolbar-card">
              <SearchAndFilter
                useGridItem={false}
                setSearchKeyword={setSearchKeyword}
                filterGroup={filterGroup}
                setFilterGroup={setFilterGroup}
                filters={group === "ballkid" ? filters : ["rookie", ...filters]}
              />
            </div>

            <div
              className={`list-by-name-cards layout-${layout}`}
            >
              {filtered.map((ballkid) => (
                <BallkidCard
                  key={ballkid.id}
                  ballkid={ballkid}
                  renderAdditional={
                    <span className="list-by-name-position">
                      {ballkid.preferred_position}
                    </span>
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
