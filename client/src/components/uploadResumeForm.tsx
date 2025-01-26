import { Button, Input, MultiSelect } from "@mantine/core";
import { IconPhoto, IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MantineInput } from "./ui/input";

type UploadResumeFormProps = {
  closeForm: () => void;
};

function UploadResumeForm({ closeForm }: UploadResumeFormProps) {
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [roles] = useState(["Intern", "New Grad", "Full Time"]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [username, setUsername] = useState("");
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
    formData.append("username", username || "Anonymous");
    formData.append("companies", JSON.stringify(companies));
    formData.append("positions", JSON.stringify(selectedRoles));
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

  const handleRoleChange = (selected: string[]) => {
    setSelectedRoles(selected);
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <div>
        <h2>Username</h2>
        <MantineInput
          value={username ?? "Anonymous"}
          onChange={(event) => setUsername(event.currentTarget.value)}
          label="Username or Discord name here (Anonymous if left blank)"
          placeholder="Enter your username"
        />
      </div>
      <h2>Role</h2>
      <MultiSelect
        label="Position(s) applied for with this resume"
        placeholder={selectedRoles.length === 0 ? "Pick value" : undefined}
        data={roles}
        value={selectedRoles}
        onChange={handleRoleChange}
        clearable
        required
      />
      <h2 className="mb-4">Passed Screening Companies</h2>
      <div className="flex flex-row flex-wrap gap-2">
        {companies.length > 0 &&
          companies.map((company, index) => (
            <div
              key={index}
              className="text-gray-700 text-sm py-1 px-3 rounded-full bg-gray-100 shadow-sm"
            >
              {company}
            </div>
          ))}
      </div>
      <div className="flex flex-row items-center gap-2 mt-4">
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
          className={`flex items-center gap-1 px-4 py-1 text-sm rounded-xl transition-colors duration-300 shadow-md ${
            value.trim()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
