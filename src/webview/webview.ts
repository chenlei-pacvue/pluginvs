export const getWebviewContent = function() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title></title>
  </head>
  <style>
  .btn {
	align-self: center;
	margin-top: 10px;
	max-width: 300px;
	width: 100%;
    background-color: cornflowerblue;
	padding: 12px;
	border-radius:4px;
	cursor: pointer;
    width:100px;
    text-align:center
	
}

  </style>
  <body style='padding-top:20px'>
  <div class='btn' data-action="pacvueextension.show18Tool">国际化工具页面</div>
  <script>
        (function() {
            const vscode = acquireVsCodeApi();
			document.addEventListener('click',function(e) {
				if (e.target.matches('[data-action]')) {
					vscode.postMessage({
						command: 'alert',
						text:e.target.dataset.action
					})
				}
			})
            
        }())
    </script>

  </body>

  </html>`;
};
export const getWebviewExport = function() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!-- 最新版本的 Bootstrap 核心 CSS 文件 -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">

<!-- 最新的 Bootstrap 核心 JavaScript 文件 -->
<script src="https://fastly.jsdelivr.net/npm/jquery@1.12.4/dist/jquery.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"
  integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd"
  crossorigin="anonymous"></script>
	  <title>国际化工具</title>
  </head>
  <style>


  </style>
  <body style='padding-top:20px'>
  <div>
    <div class="jumbotron">
    <h1>国际化文案导出工具</h1>
    
    <div class="form-group">
        <label for="exampleInputFile">选择需要翻译的国际化文件</label>
        <input type="file" id="excel">
    </div>
    <div class="form-group">
        <label for="sheet">需要导出的sheet名称</label>
        <input type='text' id="sheetname">
    </div>

    <div class="form-group" style='width:300px'>
        <label for="place">选择导出位置</label>
        <div class="input-group">
        <input type="text" class="form-control" id='filePath'>
        <span class="input-group-btn">
          <button class="btn btn-default" type="button"><span id='toSelect' class="glyphicon glyphicon-inbox" aria-hidden="true"></span></button>
        </span>
      </div>
    </div>

    <p><a class="btn btn-primary btn-lg" href="#" id='okFun' role="button">确定</a></p>
    </div>
  </div>
  <script>
        (function() {
            const vscode = acquireVsCodeApi();
            // document.getElementById('excel').onchange=function(e){
            //     // alert(e.target.files[0].path)
            //     vscode.postMessage({
            //         command: 'export',
            //         text:e.target.files[0].path
            //     })
            //   }webkitdirectory
            
            document.getElementById('toSelect').addEventListener('click', function() {
                vscode.postMessage({
                    command: 'selectfile'
                })
            })
			document.getElementById('okFun').addEventListener('click',function(e) {
				vscode.postMessage({
                    command: 'export',
                    text:{
                        file:  document.getElementById('excel').files[0].path,
                        outFile: document.getElementById('filePath').value,
                        sheetname: document.getElementById('sheetname').value
                    }
                })
			})

            window.addEventListener('message', event => {

                const message = event.data; // The JSON data our extension sent
    
                switch (message.command) {
                    case 'refactor':
                       document.getElementById('filePath').value = message.text
                        break;
                }
            });
            
        }())
    </script>

  </body>

  </html>`;
}