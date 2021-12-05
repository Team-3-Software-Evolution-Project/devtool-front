import React from "react";
import { DiJavascript1, DiCss3Full, DiHtml5, DiReact, DiPython, DiJava } from "react-icons/di";
import { SiGodotengine, SiCplusplus } from "react-icons/si"
import { CgReadme } from "react-icons/cg"
import { VscJson } from "react-icons/vsc"
import { AiOutlineFileImage } from "react-icons/ai"

const FILE_ICONS = {
  js: <DiJavascript1 />,
  css: <DiCss3Full />,
  html: <DiHtml5 />,
  jsx: <DiReact />,
  py: <DiPython />,
  java: <DiJava />,
  gd: <SiGodotengine />,
  cpp: <SiCplusplus />,
  hpp: <SiCplusplus />,
  cxx: <SiCplusplus />,
  hxx: <SiCplusplus />,
  md: <CgReadme />,
  json: <VscJson />,
  png: <AiOutlineFileImage />,
  jpg: <AiOutlineFileImage />,
  jpeg: <AiOutlineFileImage />,
};

export default FILE_ICONS;
