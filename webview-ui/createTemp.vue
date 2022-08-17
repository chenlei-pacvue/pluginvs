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
import { reactive } from "vue";
import "@vscode/codicons/dist/codicon.css";

provideVSCodeDesignSystem().register(vsCodeButton());
provideVSCodeDesignSystem().register(vsCodeRadioGroup());
provideVSCodeDesignSystem().register(vsCodeRadio());
provideVSCodeDesignSystem().register(vsCodeTextField());
provideVSCodeDesignSystem().register(vsCodeProgressRing());
provideVSCodeDesignSystem().register(vsCodePanelTab());
provideVSCodeDesignSystem().register(vsCodePanels());
provideVSCodeDesignSystem().register(vsCodePanelView());

const data = reactive({
  isCreate: false,
  projectName: '',
  nowplace: 'vue2',
  targetFile: '',
});
function tabchange(e: any) {
  data.nowplace = e.target._activeid
}
function selectFile() {
  vscode.postMessage({
    command: "selectfile"
  });
}
function inputchange(e: any) {
  data.projectName = e.target._value;
}
function create() {
  data.isCreate = true
  vscode.postMessage({
    command: "create",
    text: {
      outPath: data.targetFile,
      projectName: data.projectName
    }
  });
}
window.addEventListener("message", (event) => {
  const message = event.data; // The JSON data our extension sent

  switch (message.command) {
    case "refactor":
      data.targetFile = message.text
      break;
    case "success":
      data.isCreate = false;
      break;
  }
});
</script>

<template>
  <main>
    <div style="height: 30px;width:100%">
      <vscode-progress-ring v-if="data.isCreate"></vscode-progress-ring>
    </div>
    <h3>创建模版项目</h3>
    <vscode-panels aria-label="Default" @change='tabchange'>
      <vscode-panel-tab id="vue2">vue2</vscode-panel-tab>
      <vscode-panel-tab id="vue3">vue3</vscode-panel-tab>
      <vscode-panel-view id="view-1"> 
        <div>
        <div class='flex' style="width:100%">
          <span style="width:100px">项目名称：</span>
          <vscode-text-field  :value="data.projectName" @input="inputchange"></vscode-text-field>
        </div>  
        <div class='flex' style="margin-top: 10px;">
          <span style="width:100px">导出的文件夹：</span>
          <vscode-button @click="selectFile"
            >选择导出的文件夹 <span slot="start" class="codicon codicon-add"></span
          ></vscode-button>
        </div> 
        </div> 
      </vscode-panel-view>
      <vscode-panel-view id="view-2"> 模版尚未开始研发。。。 </vscode-panel-view>

    </vscode-panels>
    <vscode-button :disabled="data.isCreate" @click='create'>开始导出</vscode-button>
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
