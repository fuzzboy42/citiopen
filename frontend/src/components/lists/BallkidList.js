import React, { useState, useEffect, useMemo } from "react";

import {
  SearchAndFilter,
  filterBallkids,
  getAuthHeader,
  getLocalStorage,
  BallkidCard,
} from "../Utils";
import { list, listNonchairperson } from "../HelpMessages";
import {
  ListPageShell,
  ListPageHeader,
  ListToolbarCard,
  ListEmpty,
} from "./ListPageLayout";

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
    <ListPageShell>
      <ListPageHeader
        title="List by Name"
        count={filtered.length}
        helpPage="List By Name"
        helpMessage={group === "chairperson" ? list : listNonchairperson}
        layout={layout}
        setLayout={setLayout}
        showLayout={ballkids.length > 0}
      />

      {ballkids.length === 0 ? (
        <ListEmpty>There are no ballkids to show.</ListEmpty>
      ) : (
        <>
          <ListToolbarCard>
            <SearchAndFilter
              useGridItem={false}
              setSearchKeyword={setSearchKeyword}
              filterGroup={filterGroup}
              setFilterGroup={setFilterGroup}
              filters={group === "ballkid" ? filters : ["rookie", ...filters]}
            />
          </ListToolbarCard>

          <div className={`list-by-name-cards layout-${layout}`}>
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
    </ListPageShell>
  );
}
