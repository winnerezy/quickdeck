"use client";

import { BiPlus } from "react-icons/bi";
import { NewFlashCard } from "@/components/NewFlashCard";
import { ChangeEvent, useEffect, useState } from "react";
import { Input, Textarea } from "@headlessui/react";
import { editDeck, getDeck, saveDeck } from "@/lib/actions";
import { redirect } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { fetchFolders } from "@/lib/redux/thunk";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeckProps, FlashCardData, State } from "@/types";
import { Decks, visibility } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

export default function EditForm({ deckId }: { deckId: string }) {
  const [deck, setDeck] = useState<DeckProps | null>(null);
  useEffect(() => {
    async function fetchDeck() {
      const res = await getDeck(deckId);
      setDeck(res);
    }
    fetchDeck();
  }, []);

  useEffect(() => {
    if (deck) {
      setTitle(deck.title);
      if (deck.description) {
        setDescription(deck.description);
      }
      setFolder(deck.folder?.name!);
      setVisible(deck.visibility);
      setFlashCards(deck.flashcards);
    }
  }, [deck]);

  const dispatch = useDispatch<AppDispatch>();

  const { toast } = useToast();

  const router = useRouter();
  const [title, setTitle] = useState<string>(deck?.title!);
  const [description, setDescription] = useState<string>(deck?.description!);
  const [folder, setFolder] = useState<string>(deck?.folder?.name!);
  const [visible, setVisible] = useState<visibility>(deck?.visibility!);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [flashcards, setFlashCards] = useState<FlashCardData[] | undefined>(
    deck?.flashcards
  );

  const handleNewFlashCard = () => {
    if (flashcards) {
      const newId = (
        flashcards.length
          ? Math.max(...flashcards.map((fc) => parseInt(fc.id, 10))) + 1
          : 1
      ).toString();
      flashcards &&
        setFlashCards((prevflashcards) => [
          ...prevflashcards!,
          { id: newId, question: "", answer: "" },
        ]);
    }
  };

  const handleRemoveFlashCard = (id: string) => {
    setFlashCards(flashcards && flashcards.filter((fc) => fc.id !== id));
  };

  const handleUpdateFlashCard = (
    id: string,
    updatedData: Partial<FlashCardData>
  ) => {
    setFlashCards(
      flashcards &&
        flashcards.map((fc) => (fc.id === id ? { ...fc, ...updatedData } : fc))
    );
  };

  useEffect(() => {
    dispatch(fetchFolders());
  }, []);

  const folders = useSelector((state: State) => state.folder.folders);

  const visibilityOptions = [
    { value: visibility.PUBLIC, label: "Public" },
    { value: visibility.PRIVATE, label: "Private" },
  ];

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await editDeck({
        id: deckId,
        flashCardId: deck?.flashcards.map((flashcard) => flashcard.id)!,
        title: title!,
        description: description!,
        flashcards: flashcards!,
        visibility: visible,
      });
      toast({
        title: "Deck edited successfully",
      });
      router.push("/my-decks");
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full flex flex-col gap-6 text-text-2">
      {deck && (
        <>
          <div className="flex flex-col max-w-[1000px] w-full space-y-8 self-center">
            <h3 className="font-semibold text-[--purple] text-2xl max-md:mt-20">
              Edit Deck
            </h3>
            <button
              className="bg-[--purple] w-24 h-10 rounded-lg self-end text-white"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-dots loading-md self-center"></span>
              ) : (
                "Edit"
              )}
            </button>
            <Input
              className="outline-none w-full py-4 border-b-2 border-[--purple] placeholder:text-gray-300 bg-transparent"
              placeholder="Enter a title e.g 'Organic Chemistry Chapter 4'"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
            />
            <Textarea
              className="outline-none w-full py-4 border-b-2 border-[--purple] placeholder:text-gray-300 bg-transparent"
              placeholder="Add a description (optional)"
              value={description!}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
            />
            <section className="self-start space-x-4 flex items-center">
              <Select onValueChange={(e) => setFolder(e)} defaultValue={folder}>
                <SelectTrigger className="w-[180px] border border-[--light-purple]">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent className="border-none bg-background">
                  <SelectGroup>
                    {folders.map((folder) => (
                      <SelectItem value={folder.id}>{folder.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                onValueChange={(e: visibility) => setVisible(e)}
                defaultValue={visible}
              >
                <SelectTrigger className="w-[180px] border border-[--light-purple]">
                  <SelectValue placeholder="Public" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {visibilityOptions.map((option) => (
                      <SelectItem value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </section>
          </div>
          <div className="flex flex-col gap-6 max-w-[1000px] w-full self-center">
            {flashcards &&
              flashcards.map((flashcard, index) => (
                <NewFlashCard
                  index={index}
                  key={flashcard.id}
                  question={flashcard.question}
                  answer={flashcard.answer}
                  onRemove={() => handleRemoveFlashCard(flashcard.id)}
                  onUpdate={(updatedData) =>
                    handleUpdateFlashCard(flashcard.id, updatedData)
                  }
                />
              ))}
            <button
              className="btn border border-[--purple] hover:border-[--purple] bg-transparent hover:bg-transparent"
              onClick={handleNewFlashCard}
            >
              <BiPlus className="size-8 text-[--purple]" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
