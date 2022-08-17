<script setup lang="ts">
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeRadioGroup,
  vsCodeRadio,
  vsCodeTextField,
  vsCodeProgressRing,
} from "@vscode/webview-ui-toolkit";

import { vscode } from "./utilities/vscode";
import { reactive } from "vue";
import "@vscode/codicons/dist/codicon.css";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(vsCodeButton());
provideVSCodeDesignSystem().register(vsCodeRadioGroup());
provideVSCodeDesignSystem().register(vsCodeRadio());
provideVSCodeDesignSystem().register(vsCodeTextField());
provideVSCodeDesignSystem().register(vsCodeProgressRing());
// To register more toolkit components, simply import the component
// registration function and call it from within the register
// function, like so:
//
// provideVSCodeDesignSystem().register(
//   vsCodeButton(),
//   vsCodeCheckbox()
// );
//
// Finally, if you would like to register all of the toolkit
// components at once, there's a handy convenience function:
//
// provideVSCodeDesignSystem().register(allComponents.register());
const data = reactive({
  radioChceck: "sheet",
  sheet: "",
  outfolder: "",
  file: "",
  isCreate: false,
});
function exportsF() {
  data.isCreate = true;
  vscode.postMessage({
    command: "export",
    text: {
      file: data.file,
      outFile: data.outfolder,
      data: { ...data },
    },
  });
}
function chooseFile() {
  vscode.postMessage({
    command: "chooseExcel",
  });
}
function selectFile() {
  vscode.postMessage({
    command: "selectfile",
  });
}
function radiochang(s: any) {
  data.radioChceck = s.target._value;
}
function inputchange(e: any) {
  data.sheet = e.target._value;
}

window.addEventListener("message", (event) => {
  const message = event.data; // The JSON data our extension sent

  switch (message.command) {
    case "refactor":
      //  document.getElementById('filePath').value = message.text
      data.outfolder = message.text;
      break;
    case "i18nfile":
      //  document.getElementById('filePath').value = message.text
      data.file = message.text;
      break;
    case "success":
      //  document.getElementById('filePath').value = message.text
      data.isCreate = false;
      break;
    case "fail":
      //  document.getElementById('filePath').value = message.text
      data.isCreate = false;
      break;
  }
});
</script>

<template>
  <main>
    <div style="height: 30px">
      <vscode-progress-ring v-if="data.isCreate"></vscode-progress-ring>
    </div>
    <h3>国际化导出</h3>
    <div>请选择需要翻译的国际化文件</div>
    <div class="flex">
      <vscode-button @click="chooseFile"
        >选择文件 <span slot="start" class="codicon codicon-add"></span
      ></vscode-button>
      <span style="margin-left: 8px">{{ data.file }}</span>
    </div>
    <div>
      <vscode-radio-group :value="data.radioChceck" @change="radiochang">
        <!-- <label slot="label">Radio Group Label</label> -->
        <vscode-radio value="all" name="all">全量导出</vscode-radio>
        <vscode-radio value="sheet" name="all">指定导出</vscode-radio>
      </vscode-radio-group>
    </div>
    <div v-if="data.radioChceck === 'sheet'" class="flex">
      <span style="margin-right: 8px">输入需要转化的sheet名称(,隔开):</span>
      <vscode-text-field
        :value="data.sheet"
        @input="inputchange"
      ></vscode-text-field>
    </div>
    <div class="flex">
      <vscode-button @click="selectFile"
        >选择导出的文件夹 <span slot="start" class="codicon codicon-add"></span
      ></vscode-button>
      <span>{{ data.outfolder }}</span>
    </div>
    <vscode-button @click="exportsF" :disabled="data.isCreate"
      >开始导出</vscode-button
    >
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
