import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/components/GlobalStore';
import { OPENAI_MODELS_TITLES } from '@/constants';
import { OpenAIModel } from '@/types';

function ConfigPage() {
  const { t } = useTranslation();
  const { openaiApiKey, setOpenAiApiKey, currentModel, setCurrentModel } = useGlobalStore();

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { openaiApiKey, selectedModel } = Object.fromEntries(formData.entries());
    if (!openaiApiKey) {
      toast.error('Please enter your API Key.');
      return;
    }
    if (!selectedModel) {
      toast.error('Please select a model.');
      return;
    }
    setOpenAiApiKey(`${openaiApiKey}`);
    setCurrentModel(selectedModel as OpenAIModel);
    toast.success('Config Saved!');
  };

  return (
    <div className="w-full max-w-full p-4 m-0 mb-12">
      <form method="post" onSubmit={handleSave}>
        <div className="mb-2 form-control">
          <label className="label">
            <span className="text-lg font-bold label-text">Model (engine)</span>
          </label>
          <select className="w-full select select-primary" defaultValue={currentModel} name="selectedModel">
            {Object.keys(OPENAI_MODELS_TITLES).map((model) => (
              <option key={model} value={model}>
                {OPENAI_MODELS_TITLES[model as OpenAIModel]}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4 form-control">
          <label className="label">
            <span className="text-lg font-bold label-text">OpenAI API Key</span>
            <span className="label-text-alt">
              Click&nbsp;
              <a
                className="link link-primary"
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
              &nbsp;to get your OpenAI API Key.
            </span>
          </label>
          <textarea
            name="openaiApiKey"
            className="h-24 break-all rounded-2xl textarea textarea-md textarea-primary"
            placeholder="Plsase paste your OpenAI API Key here."
            defaultValue={openaiApiKey}
            required
          ></textarea>
        </div>
        <div className="form-control">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default ConfigPage;