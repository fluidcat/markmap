import {
	writable
} from 'svelte/store';

export const show = writable(false);
export const markdownSource = writable(decodeURI(`---
maxWidth: 600
---

# 主题
## 1
### 1.1
#### 1.1.1
- 末项1
- 末项2
  - 末项2-1
  - 末项2-2
- 末项3
#### 1.1.2
### 1.2
### 1.3
## 2
### 2.1
#### 2.1.1
#### 2.1.2
### 2.2
`));
export const baseURL = writable('');
export const mindmapSaveAsSvg = writable(false);
export const mindmapSaveAsPng = writable(false);
export const mindmapSaveAsHtml = writable(false);
export const mindmapShareByGithub = writable(false);
export const wValue = writable();
export const hValue = writable();
