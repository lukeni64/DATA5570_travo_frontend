import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BulletListInput } from '@/components/BulletListInput';
import { DropdownSelector } from '@/components/DropdownSelector';
import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createReview } from '@/store/travoSlice';

export default function CreatePostScreen() {
  const dispatch = useAppDispatch();
  const { activeUserId, cities, createReviewStatus, error, users } = useAppSelector(
    (state) => state.travo,
  );
  const activeUser = users.find((user) => user.user_key === activeUserId);

  const [stateName, setStateName] = useState<string>();
  const [cityName, setCityName] = useState<string>();
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [rating, setRating] = useState<number | undefined>();
  const [formMessage, setFormMessage] = useState('');

  const stateOptions = useMemo(
    () => [...new Set(cities.map((city) => city.state_name))].sort((left, right) => left.localeCompare(right)),
    [cities],
  );
  const cityOptions = useMemo(
    () =>
      cities
        .filter((city) => city.state_name === stateName)
        .map((city) => city.city)
        .sort((left, right) => left.localeCompare(right)),
    [cities, stateName],
  );

  const selectedCity = useMemo(
    () => cities.find((city) => city.state_name === stateName && city.city === cityName),
    [cities, cityName, stateName],
  );

  const resetForm = () => {
    setStateName(undefined);
    setCityName(undefined);
    setDescription('');
    setStartDate('');
    setEndDate('');
    setPros([]);
    setCons([]);
    setRating(undefined);
  };

  const onSubmit = async () => {
    if (!activeUserId) {
      setFormMessage('Create or select a traveler profile in Account before posting.');
      return;
    }
    if (!selectedCity || !rating || !description.trim()) {
      setFormMessage('State, city, rating, and description are required.');
      return;
    }

    setFormMessage('');

    try {
      await dispatch(
        createReview({
          user: activeUserId,
          city: selectedCity.id,
          rating,
          description: description.trim(),
          pros: pros.join('\n'),
          cons: cons.join('\n'),
          date_start: startDate || undefined,
          date_end: endDate || undefined,
        }),
      ).unwrap();

      resetForm();
      setFormMessage('Post submitted to the backend.');
    } catch {
      // The slice stores the API error for display.
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create a live review</Text>
        <Text style={styles.cardSubtitle}>
          {activeUser
            ? `Posting as @${activeUser.username}`
            : 'Choose a backend user in Account first so this review has an owner.'}
        </Text>
      </View>

      <DropdownSelector
        label="State"
        value={stateName}
        options={stateOptions}
        placeholder="Select state"
        onSelect={(value) => {
          setStateName(value);
          setCityName(undefined);
        }}
      />
      <DropdownSelector
        label="City"
        value={cityName}
        options={cityOptions}
        placeholder={stateName ? 'Select city' : 'Select state first'}
        onSelect={setCityName}
      />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Share your experience..."
        multiline
        numberOfLines={4}
        style={styles.multiline}
      />
      <InputField
        label="Trip Start Date"
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
      />
      <InputField
        label="Trip End Date"
        value={endDate}
        onChangeText={setEndDate}
        placeholder="YYYY-MM-DD"
      />
      <BulletListInput label="Pros" items={pros} onChange={setPros} />
      <BulletListInput label="Cons" items={cons} onChange={setCons} />
      <DropdownSelector
        label="Rating"
        value={rating ? `${rating} / 5` : undefined}
        options={['1', '2', '3', '4', '5']}
        placeholder="Select rating"
        onSelect={(value) => setRating(Number(value))}
      />

      <Text style={styles.helperText}>
        Image upload and auth-backed posting come next. This pass saves the review fields the current API supports.
      </Text>
      {formMessage ? <Text style={styles.successText}>{formMessage}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.submitButton, createReviewStatus === 'loading' && styles.submitButtonDisabled]}
        onPress={() => void onSubmit()}>
        <Text style={styles.submitButtonText}>
          {createReviewStatus === 'loading' ? 'Submitting...' : 'Submit Post'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 130,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  helperText: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  successText: {
    color: colors.accentBlue,
    fontWeight: '600',
    marginBottom: 10,
  },
  errorText: {
    color: colors.accentClay,
    fontWeight: '600',
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 6,
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
