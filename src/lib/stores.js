import {
	writable, get
} from 'svelte/store';
import { persisted } from 'svelte-persisted-store'

export const show = writable(false);
// export const markdownSource = writable(decodeURI(`---
export const markdownSource = persisted('md-source-key', decodeURI(`---
maxWidth: 600
---

# 一个\`#\`表示中心主题
## 开头每多一个\`#\`表示往下发散下级分支
## 比如两个\`##\`
### 三个\`###\`
#### 四个\`####\`
### 没有下级，但是有内容项可以用"\`-\`加空格"
- 打车费: 100
- 餐饮费: 34
- 高温补贴: 500

## 建议空行写法

- 比如这里
- 看起来更加清晰
- for Emacs

## 其他功能介绍

Note that if blocks and lists appear at the same level, the lists will be ignored.

### Lists

- 超链接功能, 如：[百度搜索](https://www.baidu.com)
- 加粗写法：**重点加粗** 
- 删除线：~~del~~ 
- 文字倾斜：*italic* 
- 文字高亮：==highlight==
- 行内代码：\`inline code\`
- [x] 打勾，中括号前面不能有文字
- [ ] 不打勾，中括号前面不能有文字
- 数学公式: Katex: $x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$ <!-- fold -->
  - [其他公式例子](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md) 
`));
export const baseURL = writable('');
export const mindmapSaveAsSvg = writable(false);
export const mindmapSaveAsPng = writable(false);
export const mindmapSaveAsHtml = writable(false);
export const mindmapShareByGithub = writable(false);
export const wValue = writable();
export const hValue = writable();
