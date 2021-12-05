import React, { useState, useEffect } from "react";
import {
  AiOutlineFolderAdd,
  AiOutlineFileAdd,
  AiOutlineFolder,
  AiOutlineFolderOpen,
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";

import {
  ActionsWrapper,
  Collapse,
  StyledName,
  VerticalLine,
} from "../Tree.style";
import { StyledFolder } from "./TreeFolder.style";

import { FILE, FOLDER } from "../state/constants";
import { useTreeContext } from "../state/TreeContext";
import { PlaceholderInput } from "../TreePlaceholderInput";

const FolderName = ({ isOpen, name, handleClick, color="black" }) => (
  <StyledName onClick={handleClick} style={{color: color}}>
    {isOpen ? <AiOutlineFolderOpen /> : <AiOutlineFolder />}
    &nbsp;&nbsp;{name}
  </StyledName>
);

const Folder = ({ id, name, children, node, suffix = "", color = "black", setOpen=false }) => {
  const { dispatch, isImparative, onNodeClick } = useTreeContext();
  const [isEditing, setEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [childs, setChilds] = useState([]);

  useEffect(() => {
    setIsOpen(setOpen)
    setChilds([children]);
  }, [children]);

  const commitFolderCreation = (name) => {
    dispatch({ type: FOLDER.CREATE, payload: { id, name } });
  };
  const commitFileCreation = (name) => {
    dispatch({ type: FILE.CREATE, payload: { id, name } });
  };
  const commitDeleteFolder = () => {
    dispatch({ type: FOLDER.DELETE, payload: { id } });
  };
  const commitFolderEdit = (name) => {
    dispatch({ type: FOLDER.EDIT, payload: { id, name } });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setChilds([children]);
  };

  const handleNodeClick = React.useCallback(
    (event) => {
      event.stopPropagation();
      onNodeClick({ node });
    },
    [node]
  );

  const handleFileCreation = (event) => {
    event.stopPropagation();
    setIsOpen(true);
    setChilds([
      ...childs,
      <PlaceholderInput
        type="file"
        onSubmit={commitFileCreation}
        onCancel={handleCancel}
      />,
    ]);
  };

  const handleFolderCreation = (event) => {
    event.stopPropagation();
    setIsOpen(true);
    setChilds([
      ...childs,
      <PlaceholderInput
        type="folder"
        onSubmit={commitFolderCreation}
        onCancel={handleCancel}
      />,
    ]);
  };

  const handleFolderRename = () => {
    setIsOpen(true);
    setEditing(true);
  };

  return (
    <StyledFolder id={id} onClick={handleNodeClick} className="tree__folder">
      <ActionsWrapper>
        {isEditing ? (
          <PlaceholderInput
            type="folder"
            style={{ paddingLeft: 0 }}
            defaultValue={name}
            onCancel={handleCancel}
            onSubmit={commitFolderEdit}
          />
        ) : (
          <FolderName
            name={name + " " + suffix}
            isOpen={isOpen}
            handleClick={() => setIsOpen(!isOpen)}
            color={color}
          />
        )}

        {isImparative && (
          <div className="actions">
            <AiOutlineEdit onClick={handleFolderRename} />
            <AiOutlineFileAdd onClick={handleFileCreation} />
            <AiOutlineFolderAdd onClick={handleFolderCreation} />
            <AiOutlineDelete onClick={commitDeleteFolder} />
          </div>
        )}
      </ActionsWrapper>
      <Collapse className="tree__folder--collapsible" isOpen={isOpen}>
        {childs}
      </Collapse>
    </StyledFolder>
  );
};

export { Folder, FolderName };
