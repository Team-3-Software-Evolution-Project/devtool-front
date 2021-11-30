import React, { useEffect, useState } from "react";
import { get } from "axios";
import "./App.css";
import { TextField } from "@mui/material";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [repoURL, setRepoURL] = useState("");
  const [repoResult, setRepoResult] = useState(undefined);

  const API_URL = "https://devtool-api.herokuapp.com";
  const GIT_COMMAND = "git log --oneline | wc -l";
  //const API_URL = "http://127.0.0.1:8000";
  //const GIT_COMMAND = "echo 33";

  const analyzeRepo = async () => {
    if (repoURL.length > 5 && repoURL.includes("git")) {
      setIsLoading(true);

      const query = `${API_URL}/analyze?git_url=${repoURL}&command=${GIT_COMMAND}`;
      const response = await get(query).catch((error) => {
        console.error(`Error: ${error.response.data.detail}`);
        alert(`Error: ${error.response.data.detail}, is the URL correct?`);
      });
      if (response) {
        setRepoResult({
          raw: response.data.result,
          url: repoURL,
          command: GIT_COMMAND,
          fileTree: response.data.file_tree,
        });
      }

      setIsLoading(false);
    }
  };

  const formatFileTree = (fileTreeString, totalCommits) => {
    let treeArray = fileTreeString.split("\n");
    var filteredArray = treeArray.map((row, index) => {
      let commits = 0;
      if (row.includes("[")) {
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
            <div>Command: {repoResult.command}</div>
            <div>Total commits: {repoResult.raw}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>
              <br />
              Directory Tree: <br />
              {formatFileTree(repoResult.fileTree, repoResult.raw)}
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default App;
