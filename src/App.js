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

  const API_URL = "https://devtool-api.herokuapp.com";
  const GIT_COMMAND = "git log --oneline | wc -l";
  //const API_URL = "http://127.0.0.1:8000";
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

  const formatFileTree = (fileTreeString, totalCommits) => {
    let treeArray = fileTreeString.split("\n");
    var filteredArray = treeArray.map((row, index) => {
      let commits = 0;
      if (row.includes("📂")) {
        return (
          <span key={index}>
            <b>{row}</b>
            <br />
          </span>
        );
      } else if (row.includes("[")) {
        commits = row.split("[")[1].replace("]", "");
      }

      // Currently 10% and 5% as limit for highlight
      let commitColor = "black";
      const commitRatio = commits / totalCommits;
      if (commitRatio > 0.1) {
        commitColor = "red";
      } else if (commitRatio > 0.05) {
        commitColor = "orange";
      }
      return (
        <span key={index} style={{ color: commitColor }}>
          {row}
          <br />
        </span>
      );
    });

    return filteredArray;
  };

  const generateFileTree = (fileTreeString, totalCommits) => {
    let treeArray = fileTreeString.split("\n");

    return (
      <Tree
        children={generateFolderContent(
          treeArray[0],
          treeArray,
          0,
          totalCommits
        )}
      ></Tree>
    );
  };

  const generateFolderContent = (row, treeArray, indents, totalCommits) => {
    console.log(`splice: ${treeArray.splice(0, 1)}`)
    //console.log(`In TreeArray: ${treeArray}`)
    let numberOfFiles = treeArray.findIndex((row) => row.includes("📂"));
    //console.log(`filesInFolder=${numberOfFiles}`);
    let newIndents = [...treeArray][numberOfFiles].split("📂")[0].length;
    //console.log(`newIndents=${newIndents}`)

    //console.log(`In TreeArray: ${[...treeArray].splice(0, numberOfFiles + 1)}`)
    return (
      <Tree.Folder
        name={row}
        children={[...treeArray].splice(0, numberOfFiles + 1).map((row, index) => {
          //console.log(`Row=${row}`);
          if (row.includes("📂") && newIndents > indents) {
            console.log(`Creating new folder: ${row}`)
            return (
              <Tree.Folder
                name={row}
                key={row+index}
                children={generateFolderContent(
                  row,
                  [...treeArray].splice(numberOfFiles),
                  newIndents,
                  totalCommits
                )}
              />
            );
          } else {
            let commits = 0;
            if (row.includes("[")) {
              commits = row.split("[")[1].replace("]", "");
            }

            // Remove Scroll-emoji
            row = row.trim().replace("📜", "");

            // Currently 10% and 5% as limit for highlight
            let commitColor = "black";
            const commitRatio = commits / totalCommits;
            if (commitRatio > 0.1) {
              commitColor = "red";
            } else if (commitRatio > 0.05) {
              commitColor = "orange";
            }
            return <Tree.File name={row} color={commitColor} />;
          }
        })}
      />
    );
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

        <div>
          {generateFileTree(
            "📂tiktok-dl/ [44]\n    📜package-lock.json [1]\n    📜.gitignore [7]\n    📜go.sum [1]\n    📜LICENSE [1]\n    📜README.md [15]\n    📜package.json [5]\n    📜go.mod [1]\n    📜main.go [10]\n    📜scraper.js [11]\n    📂models/ [20]\n        📜upload_test.go [6]\n        📜upload.go [7]\n        📂config/ [8]\n            📜config.go [8]\n    📂resources/ [5]\n        📜errorStrings.go [1]\n        📜flags.go [2]\n        📜messages.go [2]\n        📜scraper.go [2]\n    📂.sonar/ [1]\n        📜sonar-project.properties [1]\n    📂client/ [18]\n        📜getVideoDetails.go [4]\n        📜getMusicUploads.go [10]\n        📜getUserUploads.go [12]\n        📜executeClientAction.go [10]\n        📜getRedirectUrl.go [3]\n        📜getHashtagUploads.go [5]\n    📂workflows/ [18]\n        📜downloadVideo.go [9]\n        📜downloadMusic.go [12]\n        📜startWorkflowByParameter.go [7]\n        📜common.go [2]\n        📜downloadShareLink.go [4]\n        📜downloadBatchFile.go [6]\n        📜downloadScrapedData.go [1]\n        📜downloadUser.go [12]\n        📜downloadHashtag.go [8]\n    📂unitTestUtil/ [1]\n        📜assert.go [1]\n        📜unitTestUtil.go [1]\n    📂generator/ [2]\n        📜resources.go [2]\n        📜generator.go [1]\n    📂utils/ [12]\n        📜archive.go [4]\n        📜downloadFile.go [4]\n        📜getUsername.go [2]\n        📜readFileAsString.go [4]\n        📜getHashtag.go [3]\n        📜getScraper.go [1]\n        📜getUsername_test.go [2]\n        📂log/ [2]\n            📜log.go [2]\n        📂fileio/ [2]\n            📜fileio.go [2]\n        📂checkErr/ [1]\n            📜checkErr.go [1]",
            "22"
          )}
        </div>

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
            <div style={{ whiteSpace: "pre-wrap" }}>
              <br />
              <b>Directory Tree:</b> <br />
              {formatFileTree(repoResult.fileTree, repoResult.totalCommits)}
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default App;
