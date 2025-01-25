import { Button, Input } from "@mantine/core";
import { IconPhoto, IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type UploadResumeFormProps = {
  closeForm: () => void;
};

function UploadResumeForm({ closeForm }: UploadResumeFormProps) {
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const addCompany = () => {
    if (value.trim() !== "") {
      setCompanies((prev) => [...prev, value.trim()]);
      setValue("");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitted(true);

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", "Anonymous");
    formData.append("companies", JSON.stringify(companies));
    mutation.mutate(formData);
  };

  const mutation = useMutation<Response, Error, FormData>({
    mutationFn: (formData: FormData) =>
      fetch(`${import.meta.env.VITE_API_BASE_URL}/resumes/upload`, {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      closeForm();
    },
    onError: () => {
      alert("Error submitting the form. Please try again.");
    },
  });

  return (
    <form onSubmit={handleSubmitForm}>
      <h2 className="mb-4">Companies</h2>
      <div className="flex flex-row flex-wrap gap-5">
        {companies.length > 0 &&
          companies.map((company, index) => (
            <div key={index} className="mb-2">
              {company}
            </div>
          ))}
      </div>
      <div className="flex flex-row items-center gap-2">
        <Input
          placeholder="Add companies"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          rightSectionPointerEvents="all"
        />
        <button
          type="button"
          onClick={addCompany}
          disabled={!value.trim()}
          className={`flex items-center gap-1 px-4 py-1 text-sm rounded-xl ${
            value.trim()
              ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <IconPlus size={20} />
          Add
        </button>
      </div>
      <div>
        <label htmlFor="file-upload" className="block mt-4">
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Button
            leftSection={<IconPhoto size={14} />}
            variant="default"
            component="span"
          >
            Upload Resume
          </Button>
        </label>
        {formSubmitted && !file && (
          <p className="text-red-500">Please select a file.</p>
        )}
      </div>
      <Button type="submit" className="mt-4">
        Submit
      </Button>
    </form>
  );
}

export default UploadResumeForm;
