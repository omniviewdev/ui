import type { Meta, StoryObj } from '@storybook/react';
import { ImageList } from './ImageList';
import { Image } from '../image';

const meta = {
  title: 'Layout/ImageList',
  component: ImageList,
  tags: ['autodocs'],
  args: {
    cols: 3,
    gap: 2,
    variant: 'standard',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'masonry', 'quilted'] },
    cols: { control: { type: 'number', min: 1, max: 6, step: 1 } },
    gap: { control: 'inline-radio', options: [0, 1, 2, 3, 4] },
  },
} satisfies Meta<typeof ImageList>;

export default meta;
type Story = StoryObj<typeof meta>;

const seeds = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export const Playground: Story = {
  render: (args) => (
    <ImageList {...args}>
      {seeds.map((seed) => (
        <ImageList.Item key={seed}>
          <Image
            src={`https://picsum.photos/seed/${seed}/400/300`}
            alt={`Photo ${seed}`}
            width="100%"
            height={200}
          />
        </ImageList.Item>
      ))}
    </ImageList>
  ),
};

export const StandardGrid: Story = {
  name: 'Standard Grid',
  render: () => (
    <ImageList cols={3} gap={2}>
      {seeds.map((seed) => (
        <ImageList.Item key={seed}>
          <Image
            src={`https://picsum.photos/seed/${seed}/400/300`}
            alt={`Photo ${seed}`}
            width="100%"
            height={200}
          />
        </ImageList.Item>
      ))}
    </ImageList>
  ),
};

export const MasonryLayout: Story = {
  name: 'Masonry Layout',
  render: () => {
    const heights = [250, 180, 320, 200, 280, 160, 300, 220, 240];
    return (
      <ImageList variant="masonry" cols={3} gap={2}>
        {seeds.map((seed, i) => (
          <ImageList.Item key={seed}>
            <Image
              src={`https://picsum.photos/seed/${seed}/400/${heights[i]}`}
              alt={`Photo ${seed}`}
              width="100%"
              height={heights[i]}
            />
          </ImageList.Item>
        ))}
      </ImageList>
    );
  },
};

export const QuiltedLayout: Story = {
  name: 'Quilted Layout',
  render: () => (
    <ImageList variant="quilted" cols={4} gap={1}>
      <ImageList.Item colSpan={2} rowSpan={2}>
        <Image
          src="https://picsum.photos/seed/100/800/600"
          alt="Featured"
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </ImageList.Item>
      <ImageList.Item>
        <Image
          src="https://picsum.photos/seed/101/400/300"
          alt="Photo 1"
          width="100%"
          height={200}
        />
      </ImageList.Item>
      <ImageList.Item>
        <Image
          src="https://picsum.photos/seed/102/400/300"
          alt="Photo 2"
          width="100%"
          height={200}
        />
      </ImageList.Item>
      <ImageList.Item>
        <Image
          src="https://picsum.photos/seed/103/400/300"
          alt="Photo 3"
          width="100%"
          height={200}
        />
      </ImageList.Item>
      <ImageList.Item>
        <Image
          src="https://picsum.photos/seed/104/400/300"
          alt="Photo 4"
          width="100%"
          height={200}
        />
      </ImageList.Item>
      <ImageList.Item colSpan={2}>
        <Image src="https://picsum.photos/seed/105/800/300" alt="Wide" width="100%" height={200} />
      </ImageList.Item>
      <ImageList.Item colSpan={2}>
        <Image
          src="https://picsum.photos/seed/106/800/300"
          alt="Wide 2"
          width="100%"
          height={200}
        />
      </ImageList.Item>
    </ImageList>
  ),
};
