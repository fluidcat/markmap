import { Octokit } from "@octokit/core";
import fs from "fs";
import { Base64 } from "js-base64";
import path from "path";

const repo = 'imgs' // 填你的仓库 repo
const owner = 'fluidcat'
const branch = 'md'
const cutToken = 'ghp_RF1p3neztheprz3Pix' // 填你的 Token
const tailToken = '29spZYiaKPdL3OtULP'
const committer = {name: 'fluidcat',email: 'belin0@163.com'}
const headers = {'X-GitHub-Api-Version': '2022-11-28'}


export const octokit = new Octokit({ auth: `${cutToken}${tailToken}`});

export const getFileContent = async(fileName) => {
    const { data: getFileResponse } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}",
        {
            owner,
            repo,
            path: fileName,
            ref: branch,
            headers,
        }
    );
    return Base64.decode(getFileResponse.content);
}

export const createOrUpdateFile = async(filePath, commitMessage) => {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, "utf8").toString("base64");
    const fileName = path.basename(fullPath);
    return await createOrUpdateStringFile(owner, repo, branch, commitMessage, content, fileName);
};

export const createOrUpdateStringFile = async(commitMessage, content, fileName) => {

        try {
            const { data: getFileResponse } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}",
                {
                    owner,
                    repo,
                    path: fileName,
                    ref: branch,
                    headers,
                }
            );

            // 如果文件存在，获取它的 sha 值以便更新
            const sha = getFileResponse.sha;
            const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}",
                {
                    owner,
                    repo,
                    branch,
                    headers,
                    committer,
                    path: fileName,
                    message: commitMessage,
                    content,
                    sha: sha
                }
            );
            console.log("文件已更新", response.data);
        } catch (error) {
            debugger
            if (error.status === 404) { 
                const option = {
                    owner,
                    repo,
                    branch,
                    headers,
                    committer,
                    path: fileName,
                    message: commitMessage,
                    content
                };
                const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}",
                    option
                );
                console.log("文件已创建", response.data);
            } else {
                console.error("操作失败:", error);
            }
        }
    }