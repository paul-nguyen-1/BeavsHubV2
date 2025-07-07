import { useState } from "react";
import ResumeModal from "./resumeModal";
import ResumeCard from "./resumeCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UploadResumeForm from "./uploadResumeForm";
import { useDisclosure } from "@mantine/hooks";
import { Button, Modal, Text } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";

type File = {
  filename: string;
  companies: string[];
  positions: string[];
  username: string;
  url: string;
};

const fetchResumes = async (): Promise<File[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/resumes/all`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch resumes");
  }

  return response.json();
};

const Resume = () => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const queryClient = useQueryClient();

  const {
    data: files = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  const mutation = useMutation<Response, Error, FormData>({
    mutationFn: (formData: FormData) =>
      fetch(`${import.meta.env.VITE_API_BASE_URL}/resumes/upload`, {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: () => {
      alert("Error uploading resume. Please try again.");
    },
  });

  return (
    <div className="w-full px-5 md:px-32 py-5">
      <div className="relative top-2 flex flex-row flex-wrap w-full bg-white rounded-lg shadow-md mb-6">
        <div className="flex flex-col gap-2 p-5">
          <Text fz="xl">Resumes Overview</Text>
          <Text fz="sm">
            Browse through resumes from current and previous OSU students
          </Text>
        </div>
      </div>
      <div className="w-full flex justify-center md:justify-start">
        <label htmlFor="file-upload" className="inline-block">
          <Button
            leftSection={<IconPhoto size={14} />}
            component="span"
            className="bg-[#d73f09] hover:opacity-85"
            onClick={open}
          >
            Upload Resume
          </Button>
        </label>
      </div>

      <Modal
        opened={opened}
        onClose={close}
        title="Upload Resume Content"
        centered
      >
        <UploadResumeForm closeForm={close} />
      </Modal>

      {mutation.isError && (
        <p className="text-red-500 mt-2">Error uploading file. Try again.</p>
      )}
      <div className="flex flex-wrap justify-start gap-5 mt-5">
        {isLoading && <p>Loading resumes...</p>}
        {error && (
          <p className="text-red-500">
            Error fetching resumes: {error.message}
          </p>
        )}
        {!isLoading &&
          !error &&
          files.map((file, index) => (
            <ResumeCard
              key={index}
              file={file}
              onClick={() => setSelectedResume(file)}
            />
          ))}
      </div>
      {selectedResume && (
        <ResumeModal
          file={selectedResume}
          onClose={() => setSelectedResume(null)}
        />
      )}
    </div>
  );
};

export default Resume;
