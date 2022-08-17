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
    text: "pacvueextension.show18Tool"
  });
}
function create () {
  vscode.postMessage({
    command: 'alert',
    text: "pacvueextension.showCreate"
  });
}
</script>

<template>
  <main>
    <vscode-button  @click='excelTool'>国际化工具</vscode-button>
    <vscode-button  @click='create'>新建项目</vscode-button>
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
