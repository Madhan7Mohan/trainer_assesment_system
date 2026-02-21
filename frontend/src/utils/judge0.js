import axios from "axios";

const BASE_URL = "https://ce.judge0.com";

export const executeCode = async (code, languageId, input) => {
  try {
    const submission = await axios.post(
      `${BASE_URL}/submissions?base64_encoded=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input
      }
    );

    const token = submission.data.token;

    while (true) {
      const response = await axios.get(
        `${BASE_URL}/submissions/${token}?base64_encoded=false`
      );

      if (response.data.status.id > 2) {
        return response.data;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

  } catch (error) {
    return {
      stdout: "",
      stderr: error.message
    };
  }
};
