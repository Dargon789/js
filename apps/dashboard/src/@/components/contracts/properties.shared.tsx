import {
  Flex,
  FormControl,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip,
} from "@chakra-ui/react";
import { Button } from "chakra/button";
import { FormErrorMessage, FormLabel } from "chakra/form";
import { BanIcon, PlusIcon, TrashIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect } from "react";
import {
  type ArrayPath,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  useFieldArray,
  type WatchObserver,
} from "react-hook-form";
import type { ThirdwebClient } from "thirdweb";
import { FileInput } from "@/components/blocks/FileInput";

type OptionalPropertiesInput = {
  [key: string]: string | number;
};

interface IPropertyFieldValues extends FieldValues {
  attributes?: OptionalPropertiesInput;
}

interface IPropertiesFormControlProps<
  TFieldValues extends IPropertyFieldValues,
> {
  control: Control<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors;
  setValue: UseFormSetValue<TFieldValues>;
  client: ThirdwebClient;
}

export const PropertiesFormControl = <
  TFieldValues extends IPropertyFieldValues,
>({
  control,
  register,
  watch,
  errors,
  setValue,
  client,
}: React.PropsWithChildren<IPropertiesFormControlProps<TFieldValues>>) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attributes" as ArrayPath<TFieldValues>,
  });

  // TODO: do we need this?
  // eslint-disable-next-line no-restricted-syntax
  useEffect(() => {
    if (fields.length === 0) {
      // biome-ignore lint/suspicious/noExplicitAny: FIXME
      append({ trait_type: "", value: "" } as any, { shouldFocus: false });
    }
  }, [fields, append]);

  return (
    <div className="flex flex-col gap-4">
      <Flex align="center" direction="row" justify="space-between">
        <FormLabel m={0}>Attributes</FormLabel>
        <Button
          colorScheme="red"
          // biome-ignore lint/suspicious/noExplicitAny: FIXME
          onClick={() => replace([{ trait_type: "", value: "" } as any])}
          rightIcon={<BanIcon className="size-4" />}
          size="xs"
          variant="outline"
        >
          Reset
        </Button>
      </Flex>
      {fields.map((field, index) => {
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
        const keyError = (errors as any)?.attributes?.[index]?.trait_type
          ?.message as string | undefined;
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
        const valueError = (errors as any)?.attributes?.[index]?.value
          ?.message as string | undefined;
        const isInvalid = !!(keyError || valueError);

        return (
          <div className="flex flex-row items-center gap-2" key={field.id}>
            <FormControl
              className="flex flex-row items-start gap-3"
              isInvalid={isInvalid}
            >
              <FormControl isInvalid={!!keyError}>
                <Input
                  {...register(
                    `attributes.${index}.trait_type` as Path<TFieldValues>,
                  )}
                  placeholder="trait_type"
                />
                <FormErrorMessage>{keyError}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!valueError}>
                {watch(
                  `attributes.${index}.value` as unknown as WatchObserver<TFieldValues>,
                ) instanceof File ? (
                  <InputGroup>
                    <Input
                      isDisabled
                      value={
                        watch(`attributes.${index}.value` as Path<TFieldValues>)
                          .name
                      }
                    />
                    <InputRightElement>
                      <TrashIcon
                        className="size-4 cursor-pointer text-red-300 hover:text-red-200"
                        onClick={() =>
                          setValue(
                            `attributes.${index}.value` as Path<TFieldValues>,
                            "" as PathValue<TFieldValues, Path<TFieldValues>>,
                          )
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                ) : (
                  <InputGroup>
                    <Input
                      {...register(
                        `attributes.${index}.value` as Path<TFieldValues>,
                      )}
                      placeholder="value"
                    />
                    <InputRightElement>
                      <Tooltip label="Upload file" shouldWrapChildren>
                        <FileInput
                          client={client}
                          setValue={(file) => {
                            setValue(
                              `attributes.${index}.value` as Path<TFieldValues>,
                              file as PathValue<
                                TFieldValues,
                                Path<TFieldValues>
                              >,
                            );
                          }}
                        >
                          <UploadIcon className="size-4 text-muted-foreground" />
                        </FileInput>
                      </Tooltip>
                    </InputRightElement>
                  </InputGroup>
                )}
                <FormErrorMessage>{valueError}</FormErrorMessage>
              </FormControl>
            </FormControl>
            <IconButton
              aria-label="remove key value pair"
              colorScheme="red"
              icon={<XIcon />}
              onClick={() => remove(index)}
              size="xs"
              variant="ghost"
            />
          </div>
        );
      })}
      <div className="flex flex-row gap-2">
        <Button
          colorScheme="purple"
          leftIcon={<PlusIcon className="size-5" />}
          onClick={() =>
            // biome-ignore lint/suspicious/noExplicitAny: FIXME
            append({ trait_type: undefined, value: undefined } as any)
          }
          size="sm"
        >
          Add Row
        </Button>
      </div>
    </div>
  );
};
