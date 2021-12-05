import React, { useEffect, useState } from "react";
import { get } from "axios";
import "./App.css";
import Tree from "./components/Tree/Tree";
import { TextField } from "@mui/material";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [repoURL, setRepoURL] = useState("");
  const [repoAfter, setRepoAfter] = useState("");
  const [repoUntil, setRepoUntil] = useState("");
  const [repoResult, setRepoResult] = useState(undefined);

  //const API_URL = "https://devtool-api.herokuapp.com";
  const GIT_COMMAND = "git log --oneline | wc -l";
  const API_URL = "http://127.0.0.1:8000";
  //const GIT_COMMAND = "echo 33";

  const analyzeRepo = async () => {
    if (repoURL.length > 5 && repoURL.includes("git")) {
      setIsLoading(true);

      let query = `${API_URL}/analyze?git_url=${repoURL}&command=${GIT_COMMAND}`;
      if (repoAfter.length > 9) {
        query += `&after=${repoAfter}`;
      }
      if (repoUntil.length > 9) {
        query += `&until=${repoUntil}`;
      }

      const response = await get(query).catch((error) => {
        console.error(`Error: ${error.response.data.detail}`);
        alert(`Error: ${error.response.data.detail}, is the URL correct?`);
      });
      if (response) {
        setRepoResult({
          totalCommits: response.data.total_commits,
          url: repoURL,
          command: GIT_COMMAND,
          fileTree: response.data.file_tree,
          averageCommits: response.data.average_commits,
          medianCommits: response.data.median_commits,
        });
      }

      setIsLoading(false);
    }
  };

  const buildFileTree = (fileTreeList, totalCommits, averageCommits) => {
    let paths = fileTreeList;

    let result = [];
    let level = { result };

    paths.forEach((path) => {
      path.split("/").reduce((r, name, i, a) => {
        if (i === 33) {
          console.log(`r: ${r}`);
          console.log(`name: ${name}`);
          console.log(`i: ${i}`);
          console.log(`a: ${a}`);
        }

        if (!r[name]) {
          r[name] = { result: [] };
          if (!name.includes(".") && !name.includes(" ")) {
            r.result.push(
              <Tree.Folder
                name={name}
                children={r[name].result}
                setOpen={i === 0 ? true : false}
              />
            );
          } else {
            let commits = 0;
            try {
              commits = name?.split("[")[1].replace("]", "");
            } catch (e) {
              console.log(e);
            }
            let commitColor = "black";
            if (commits > averageCommits * 2.5) {
              commitColor = "red";
            } else if (commits > averageCommits * 1.4) {
              commitColor = "orange";
            }
            r.result.push(<Tree.File name={name} color={commitColor} />);
          }
        }

        return r[name];
      }, level);
    });

    console.log(result);
    return <Tree children={result} />;
  };

  const Footer = () => (
    <div className="footer">
      <p>
        Created by Team 3<br />
        <a
          href="https://github.com/Team-3-Software-Evolution-Project"
          target="_blank"
          rel="noopener noreferrer"
        >
          Our Github
        </a>
      </p>
    </div>
  );

  const getCurrentDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();

    return year + "-" + month + "-" + date;
  };

  // Doing this to wake up Heroku instance if it is sleeping (not used within 30 minutes)
  const pingAPI = () => {
    fetch(API_URL);
  };

  useEffect(() => {
    pingAPI();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Wave emoji">
            👋
          </span>{" "}
          Hey there!
        </div>

        <div className="bio">
          This application is capable of analyzing how many times files in a
          git-repo have been changed, cool right?{" "}
          <span role="img" aria-label="Hacker cat emoji">
            🐱‍💻
          </span>
        </div>

        {isLoading ? (
          <div className="lds-facebook">
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <div className="repoContainer">
            <TextField
              id="outlined-basic"
              label="Repo URL"
              variant="outlined"
              color="secondary"
              onChange={(event) => setRepoURL(event.target.value)}
            />
            <div className="dateContainer">
              <TextField
                id="outlined-basic"
                label="After (YYYY-MM-DD)"
                variant="outlined"
                color="secondary"
                value="2000-01-01"
                onChange={(event) => setRepoAfter(event.target.value)}
              />
              <TextField
                id="outlined-basic"
                label="Until (YYYY-MM-DD)"
                variant="outlined"
                color="secondary"
                value={getCurrentDate()}
                onChange={(event) => setRepoUntil(event.target.value)}
              />
            </div>
            <button className="repoButton" onClick={() => analyzeRepo()}>
              Analyze repository
            </button>
          </div>
        )}

        {repoResult && (
          <div
            style={{
              backgroundColor: "OldLace",
              marginTop: "16px",
              padding: "16px",
              border: "0",
              borderRadius: "10px",
            }}
          >
            <div>Repository: {repoResult.url}</div>
            <div>
              Command: <i>{repoResult.command}</i>
            </div>
            <div>
              <br />
              <b>Commit Stats:</b>
            </div>
            <div>Total: {repoResult.totalCommits}</div>
            <div>Average: {repoResult.averageCommits}</div>
            <div>Median: {repoResult.medianCommits}</div>
            <div>
              <br />
              <b>Directory Tree:</b> <br />
              {buildFileTree(
                repoResult.fileTree,
                repoResult.totalCommits,
                repoResult.averageCommits
              )}
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default App;
