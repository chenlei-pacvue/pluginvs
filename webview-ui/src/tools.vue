<script setup lang="ts">
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeRadioGroup,
  vsCodeRadio,
  vsCodeTextField,
  vsCodeProgressRing,
  vsCodePanelTab,
  vsCodePanels,
  vsCodePanelView,
} from "@vscode/webview-ui-toolkit";

import { vscode } from "./utilities/vscode";
// import { reactive } from "vue";
import "@vscode/codicons/dist/codicon.css";

provideVSCodeDesignSystem().register(vsCodeButton());
provideVSCodeDesignSystem().register(vsCodeRadioGroup());
provideVSCodeDesignSystem().register(vsCodeRadio());
provideVSCodeDesignSystem().register(vsCodeTextField());
provideVSCodeDesignSystem().register(vsCodeProgressRing());
provideVSCodeDesignSystem().register(vsCodePanelTab());
provideVSCodeDesignSystem().register(vsCodePanels());
provideVSCodeDesignSystem().register(vsCodePanelView());
function excelTool () {
  vscode.postMessage({
    command: 'alert',
    text: "metro.show18Tool"
  });
}
function create () {
  vscode.postMessage({
    command: 'alert',
    text: "metro.showCreate"
  });
}
function initProject() {
  vscode.postMessage({
    command: 'alert',
    text: "metro.initProject"
  });
}
function runcode() {

}
function buildcode() {

}
function lowcode() {
  vscode.postMessage({
    command: 'alert',
    text: "metro.lowCodePanel"
  });
}
</script>

<template>
  <main>
    <vscode-button  @click='create' style="width: 200px;">新建项目</vscode-button>
    <vscode-button  @click='initProject' style="width: 200px;">初始化项目</vscode-button>
    <vscode-button  @click='runcode' style="width: 200px;">运行项目</vscode-button>
    <vscode-button  @click='lowcode' style="width: 200px;">低代码</vscode-button>
    <vscode-button  @click='buildcode' style="width: 200px;">编译项目</vscode-button>
  </main>
</template>

<style>
.flex {
  display: flex;
  align-items: center;
  /* flex-direction: row; */
}
body {
  background: var(--vscode-editor-background);
  color: var(--vscode-foreground);
}
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}

main > * {
  margin: 8px 0;
}
</style>
